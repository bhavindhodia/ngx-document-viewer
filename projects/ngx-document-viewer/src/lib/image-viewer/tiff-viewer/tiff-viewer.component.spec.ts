import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiffViewerComponent } from './tiff-viewer.component';

describe('TiffViewerComponent', () => {
  let component: TiffViewerComponent;
  let fixture: ComponentFixture<TiffViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiffViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiffViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
