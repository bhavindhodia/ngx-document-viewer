import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResourceLoaderService } from '@ngx-document-viewer';
import type { EventBus } from 'pdfjs-dist/web/pdf_viewer.mjs';
import { fromEvent } from 'rxjs';

// interface EventBus {
//   on(eventName: string, listener: Function): void;
//   off(eventName: string, listener: Function): void;
//   _listeners: any;
//   dispatch(eventName: string, data: Object): void;
//   _on(eventName: any, listener: any, options?: null): void;
//   _off(eventName: any, listener: any, options?: null): void;
// }

export function createEventBus(
  pdfJsViewer: any,
  destroy$: DestroyRef,
  resourceLoader: ResourceLoaderService
) {
  const globalEventBus: EventBus = new pdfJsViewer.EventBus();
  attachDOMEventsToEventBus(globalEventBus, destroy$, resourceLoader);
  return globalEventBus;
}

function attachDOMEventsToEventBus(
  eventBus: EventBus,
  destroy$: DestroyRef,
  resourceLoader: ResourceLoaderService
): void {
  fromEvent(eventBus, 'documentload')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(() => {
      window.dispatchEvent(new CustomEvent('documentload', {}));
    });
  fromEvent(eventBus, 'pagerendered')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ pageNumber, cssTransform, source }: any) => {
      source.div.dispatchEvent(
        new CustomEvent('pagerendered', {
          detail: { pageNumber, cssTransform },
        })
      );
    });

 fromEvent(eventBus, 'pagechanging')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ pageNumber, source }: any) => {
      const event = new CustomEvent('pagechanging',{detail:{pageNumber,source}})
      resourceLoader.setPage(pageNumber)
      source.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'pagesinit')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ source }: any) => {
      source.container.dispatchEvent(new CustomEvent('pagesinit', {}));
    });

  fromEvent(eventBus, 'pagesloaded')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ pagesCount, source }: any) => {
      //const event = document.createEvent('CustomEvent');
      //event.initCustomEvent('pagesloaded', true, true, { pagesCount });
      source.container.dispatchEvent(
        new CustomEvent('pagesloaded', { detail: pagesCount, bubbles: true })
      );
    });
  fromEvent(eventBus, 'scalechange')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ scale, presetValue, source }: any) => {
      const event = document.createEvent('UIEvents') as any;
      console.log('scalechange', scale);

      event.initEvent('scalechange', true, true);
      //tslint:disable:no-string-literal
      event['scale'] = scale;
      //tslint:disable:no-string-literal
      event['presetValue'] = presetValue;
      source.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'updateviewarea')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ location, source }: any) => {
      const event = document.createEvent('UIEvents') as any;
      event.initEvent('updateviewarea', true, true);
      event['location'] = location;
      source.container.dispatchEvent(event);
    });
  fromEvent(eventBus, 'pagemode')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ mode, source }: any) => {
      /* const event = document.createEvent('CustomEvent');
      event.initCustomEvent('pagemode', true, true, { mode }); */
      source.pdfViewer.container.dispatchEvent(new CustomEvent('pagemode',{detail:mode,bubbles:true}));
    });
  /*

  fromEvent(eventBus, 'textlayerrendered')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ pageNumber, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('textlayerrendered', true, true, { pageNumber });
      source.textLayerDiv?.dispatchEvent(event);
    });





  fromEvent(eventBus, 'find')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(
      ({
        source,
        type,
        query,
        phraseSearch,
        caseSensitive,
        highlightAll,
        findPrevious,
      }: any) => {
        if (source === window) {
          return; // event comes from FirefoxCom, no need to replicate
        }
        const event = document.createEvent('CustomEvent');
        event.initCustomEvent('find' + type, true, true, {
          query,
          phraseSearch,
          caseSensitive,
          highlightAll,
          findPrevious,
        });
        window.dispatchEvent(event);
      }
    );

  fromEvent(eventBus, 'attachmentsloaded')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ attachmentsCount, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('attachmentsloaded', true, true, {
        attachmentsCount,
      });
      source.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'sidebarviewchanged')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ view, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('sidebarviewchanged', true, true, { view });
      source.outerContainer.dispatchEvent(event);
    });



  fromEvent(eventBus, 'namedaction')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ action, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('namedaction', true, true, { action });
      source.pdfViewer.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'presentationmodechanged')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ active, switchInProgress }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('presentationmodechanged', true, true, {
        active,
        switchInProgress,
      });
      window.dispatchEvent(event);
    });

  fromEvent(eventBus, 'outlineloaded')
    .pipe(takeUntilDestroyed(destroy$))
    .subscribe(({ outlineCount, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('outlineloaded', true, true, { outlineCount });
      source.container.dispatchEvent(event);
    }); */
}
