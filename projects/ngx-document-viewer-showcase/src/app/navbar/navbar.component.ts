import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResourceLoaderService } from '@ngx-document-viewer';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { Menubar } from 'primeng/menubar';
import { PaginatorState } from 'primeng/paginator';
import { Ripple } from 'primeng/ripple';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    Menubar,
    Ripple,
    FormsModule,
    CommonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    ButtonModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  @Output() prevNavigation = new EventEmitter();
  @Output() nextNavigation = new EventEmitter();
  resourceLoaderService = inject(ResourceLoaderService);
  items: MenuItem[] | undefined;
  private static readonly ZOOM_IN = 1.1;
  private static readonly ZOOM_OUT = 0.9;
  private static readonly ROTATION = 90;
  destroy$ = inject(DestroyRef);
  rows2: number = 10;
  onPageChange2(event: PaginatorState) {
    //this.paginator = event.first ?? 0;
    this.rows2 = event.rows ?? 10;
  }

  get page(): number {
    return this.resourceLoaderService.page();
  }

  constructor() {}

  onPageChange(event: any) {
    console.log('EVENT', event);
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Setting',
        icon: 'pi pi-cog',
      },
      {
        label: 'Zoom In',
        icon: 'pi pi-search-plus',
        command: (event: MenuItemCommandEvent) => {
          this.resourceLoaderService.setZoom(
            this.resourceLoaderService.zoom() * NavbarComponent.ZOOM_IN
          );
        },
      },
      {
        label: 'Zoom Out',
        icon: 'pi pi-search-minus',
        command: (event: MenuItemCommandEvent) => {
          this.resourceLoaderService.setZoom(
            this.resourceLoaderService.zoom() * NavbarComponent.ZOOM_OUT
          );
        },
      },
      {
        label: 'Rotate Left',
        icon: 'pi pi-undo',
        command: (event: MenuItemCommandEvent) => {
          this.resourceLoaderService.setRotation(
            this.resourceLoaderService.rotation() + NavbarComponent.ROTATION
          );
        },
      },
      {
        label: 'Rotate Right',
        icon: 'pi pi-refresh',
        command: (event: MenuItemCommandEvent) => {
          console.log('RB', this.resourceLoaderService.rotation());
          this.resourceLoaderService.setRotation(
            this.resourceLoaderService.rotation() - 90
          );
          console.log('RA', this.resourceLoaderService.rotation());
        },
      },
    ];
  }
}
