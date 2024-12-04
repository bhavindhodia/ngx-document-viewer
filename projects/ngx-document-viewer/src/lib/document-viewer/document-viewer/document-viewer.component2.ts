import {
  Component,
  effect,
  Input,
  input,
  OnInit,
  ViewChild,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';

export enum ValidDocumentExtensions {
  PDF = 'pdf',
  TIFF = 'tiff',
  JPEG = 'jpeg',
  JPG = 'jpg',
}

export interface ComponentInputTypes {
  name: string;
  value: any;
  title?: string;
}

@Component({
  selector: 'lib-document-viewer',
  standalone: true,
  imports: [],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.css',
})
export class DocumentViewerComponent implements OnInit {
  @ViewChild('documentContainer', {
    static: true,
    read: ViewContainerRef,
  })
  container!: ViewContainerRef;
  @Input() documentUrl!: WritableSignal<string>;

  constructor() {
    effect(() => {
      console.log("DOCUMENT VIEWER EFFECT RUN",this.documentUrl());
      const documentType = this.getExtensionFromUrl(this.documentUrl());
      this.createDynamicWidget(documentType, {
        name: 'src',
        value: this.documentUrl(),
      });
    });
  }
  ngOnInit(): void {}

  getComponentByTypes = (
    type: string,
    componentInputs?: ComponentInputTypes
  ) => {
    switch (type) {
      case ValidDocumentExtensions.PDF:
        return {
          component: () =>
            import('../../pdf-viewer/pdf-viewer/pdf-viewer.component').then(
              (m) => m.PdfViewerComponent
            ),
          inputs: [
            { name: 'title', value: 'PDF From Document' },
            componentInputs,
          ],
        };
      case ValidDocumentExtensions.JPEG:
      case ValidDocumentExtensions.JPG:
        return {
          component: () =>
            import(
              '../../image-viewer/image-viewer/image-viewer.component'
            ).then((m) => m.ImageViewerComponent),
          inputs: [{ name: 'title', value: 'PDF From Document' }],
          //inputs: statisticData.find((item) => item['id'] === type)!,
        };
      default:
        throw new Error('Weird ! Invalid File Extension');
      /*   return {
          component: () =>
            import('./@shared/components/widget/widget.component').then(
              (m) => m.WidgetComponent
            ),
          inputs: statisticData.find((item) => item['id'] === type)!,
        }; */
    }
  };
  async createDynamicWidget(
    type: string,
    additionalInput?: ComponentInputTypes
  ) {
    this.container.clear();
    const { component, inputs } = this.getComponentByTypes(
      type,
      additionalInput
    );
    const componentInstance = await component();
    const componentRef = this.container.createComponent(componentInstance);
    inputs.forEach(
      (input) => input && componentRef.setInput(input.name, input.value)
    );
  }
  private getExtensionFromUrl(url: string): string {
    const extension = new URL(url).pathname
      .split('/')
      .pop()
      ?.split('.')
      .pop()
      ?.toLowerCase();
    if (extension) {
      return extension.trim();
    }
    return '';
  }
}
