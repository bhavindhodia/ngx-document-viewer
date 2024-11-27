import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  leftNavbarIcons,
  rightNavbarIcons,
  bottomNavbarIcons,
  NavbarIconTypes,
} from './navbar-icon.config';
import { DocumentViewerComponent } from "../../../../ngx-document-viewer/src/lib/document-viewer/document-viewer/document-viewer.component";
import { Toolbar } from 'primeng/toolbar';
import { ToolbarService } from '@ngx-document-viewer';
import { DrawerModule } from 'primeng/drawer';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule, DocumentViewerComponent, Toolbar, DrawerModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  leftNavbarIcons = leftNavbarIcons;
  rightNavbarIcons = rightNavbarIcons;
  bottomNavbarIcons = bottomNavbarIcons;
  private _toolbarService = inject(ToolbarService);
  constructor() {}
  handleIconClick(icon: NavbarIconTypes) {
    this._toolbarService.toogleEditPen();
  }
}
