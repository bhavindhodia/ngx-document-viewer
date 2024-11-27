import { fromEvent, Subject, takeUntil } from 'rxjs';
import type { EventBus } from 'pdfjs-dist/web/pdf_viewer.mjs';
import { DestroyRef } from '@angular/core';

// interface EventBus {
//   on(eventName: string, listener: Function): void;
//   off(eventName: string, listener: Function): void;
//   _listeners: any;
//   dispatch(eventName: string, data: Object): void;
//   _on(eventName: any, listener: any, options?: null): void;
//   _off(eventName: any, listener: any, options?: null): void;
// }

export function createEventBus(pdfJsViewer: any, destroy$: any) {
  const globalEventBus: EventBus = new pdfJsViewer.EventBus();
  attachDOMEventsToEventBus(globalEventBus, destroy$);
  return globalEventBus;
}

function attachDOMEventsToEventBus(eventBus: EventBus, destroy$: any): void {
  fromEvent(eventBus, 'documentload')
    .pipe(takeUntil(destroy$))
    .subscribe(() => {
      window.dispatchEvent(new CustomEvent('documentload', {}));
    });
  fromEvent(eventBus, 'pagerendered')
    .pipe(takeUntil(destroy$))
    .subscribe(({ pageNumber, cssTransform, source }: any) => {
      source.div.dispatchEvent(
        new CustomEvent('pagerendered', {
          detail: { pageNumber, cssTransform },
        })
      );
    });

  fromEvent(eventBus, 'pagechanging')
    .pipe(takeUntil(destroy$))
    .subscribe(({ pageNumber, source }: any) => {
      const event = document.createEvent('UIEvents') as any;
      event.initEvent('pagechanging', true, true);
      //tslint:disable:no-string-literal
      event['pageNumber'] = pageNumber;
      source.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'pagesinit')
    .pipe(takeUntil(destroy$))
    .subscribe(({ source }: any) => {
      console.log('pagesinit', source);
      source.container.dispatchEvent(new CustomEvent('pagesinit', {}));
    });

  fromEvent(eventBus, 'pagesloaded')
    .pipe(takeUntil(destroy$))
    .subscribe(({ pagesCount, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('pagesloaded', true, true, { pagesCount });
      source.container.dispatchEvent(event);
    });
  /*

  fromEvent(eventBus, 'textlayerrendered')
    .pipe(takeUntil(destroy$))
    .subscribe(({ pageNumber, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('textlayerrendered', true, true, { pageNumber });
      source.textLayerDiv?.dispatchEvent(event);
    });



  fromEvent(eventBus, 'scalechange')
    .pipe(takeUntil(destroy$))
    .subscribe(({ scale, presetValue, source }: any) => {
      const event = document.createEvent('UIEvents') as any;
      event.initEvent('scalechange', true, true);
      //tslint:disable:no-string-literal
      event['scale'] = scale;
      //tslint:disable:no-string-literal
      event['presetValue'] = presetValue;
      source.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'updateviewarea')
    .pipe(takeUntil(destroy$))
    .subscribe(({ location, source }: any) => {
      const event = document.createEvent('UIEvents') as any;
      event.initEvent('updateviewarea', true, true);
      event['location'] = location;
      source.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'find')
    .pipe(takeUntil(destroy$))
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
    .pipe(takeUntil(destroy$))
    .subscribe(({ attachmentsCount, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('attachmentsloaded', true, true, {
        attachmentsCount,
      });
      source.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'sidebarviewchanged')
    .pipe(takeUntil(destroy$))
    .subscribe(({ view, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('sidebarviewchanged', true, true, { view });
      source.outerContainer.dispatchEvent(event);
    });

  fromEvent(eventBus, 'pagemode')
    .pipe(takeUntil(destroy$))
    .subscribe(({ mode, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('pagemode', true, true, { mode });
      source.pdfViewer.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'namedaction')
    .pipe(takeUntil(destroy$))
    .subscribe(({ action, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('namedaction', true, true, { action });
      source.pdfViewer.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'presentationmodechanged')
    .pipe(takeUntil(destroy$))
    .subscribe(({ active, switchInProgress }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('presentationmodechanged', true, true, {
        active,
        switchInProgress,
      });
      window.dispatchEvent(event);
    });

  fromEvent(eventBus, 'outlineloaded')
    .pipe(takeUntil(destroy$))
    .subscribe(({ outlineCount, source }: any) => {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent('outlineloaded', true, true, { outlineCount });
      source.container.dispatchEvent(event);
    }); */
}
