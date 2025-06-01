import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {Ripple} from 'primeng/ripple';
import {Menubar} from 'primeng/menubar';
import {CommonModule} from '@angular/common';
import {MenuItem, MenuItemCommandEvent} from 'primeng/api';
import {PaginatorState} from 'primeng/paginator';
import {FormsModule} from '@angular/forms';
import {InputGroupModule} from 'primeng/inputgroup';
import {InputGroupAddonModule} from 'primeng/inputgroupaddon';
import {InputNumberModule} from 'primeng/inputnumber';
import {ButtonModule} from 'primeng/button';
import {ResourceLoaderService} from '@ngx-document-viewer';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [Menubar, Ripple,FormsModule,CommonModule,InputGroupModule, InputGroupAddonModule,InputNumberModule,ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit{
  @Output() prevNavigation = new EventEmitter()
  @Output() nextNavigation = new EventEmitter()
  items: MenuItem[] | undefined;
  private static readonly ZOOM_IN = 1.1
  private static readonly ZOOM_OUT = 0.90
  private static readonly ROTATION = 90
  first2: number = 0;
  rows2: number = 10;
  private  resourceLoaderService = inject(ResourceLoaderService)
  onPageChange2(event: PaginatorState) {
    this.first2 = event.first ?? 0;
    this.rows2 = event.rows ?? 10;
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
          this.resourceLoaderService.setZoom(this.resourceLoaderService.zoom() * NavbarComponent.ZOOM_IN);
        }
      },
      {
        label: 'Zoom Out',
        icon: 'pi pi-search-minus',
        command: (event: MenuItemCommandEvent) => {
          this.resourceLoaderService.setZoom(this.resourceLoaderService.zoom() * NavbarComponent.ZOOM_OUT);
        }
      },
      {
        label: 'Rotate Left',
        icon: 'pi pi-undo',
        command: (event: MenuItemCommandEvent) => {
          this.resourceLoaderService.setRotation(this.resourceLoaderService.rotation() + NavbarComponent.ROTATION);
        }
      },
      {
        label: 'Rotate Right',
        icon: 'pi pi-refresh',
        command: (event: MenuItemCommandEvent) => {
          console.log("RB",this.resourceLoaderService.rotation())
          this.resourceLoaderService.setRotation(this.resourceLoaderService.rotation() - 90);
          console.log("RA",this.resourceLoaderService.rotation())
        }
      },

    ];
  }
}
