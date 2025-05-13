import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Ripple} from 'primeng/ripple';
import {Menubar} from 'primeng/menubar';
import {CommonModule} from '@angular/common';
import {MenuItem} from 'primeng/api';
import {PaginatorState} from 'primeng/paginator';
import {FormsModule} from '@angular/forms';
import {InputGroupModule} from 'primeng/inputgroup';
import {InputGroupAddonModule} from 'primeng/inputgroupaddon';
import {InputNumberModule} from 'primeng/inputnumber';
import {ButtonModule} from 'primeng/button';

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
  first2: number = 0;
  rows2: number = 10;
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
      },
      {
        label: 'Zoom Out',
        icon: 'pi pi-search-minus',
      },

    ];
  }
}
