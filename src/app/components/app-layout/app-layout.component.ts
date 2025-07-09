import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './elements/topbar/topbar.component';
import { SidebarComponent } from './elements/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../services/layout.service';
import {FooterComponent} from "./elements/footer/footer.component";

@Component({
  selector: 'app-layout',
  standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        TopbarComponent,
        SidebarComponent,
        FooterComponent,
    ],
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent {
  public title?: string;

  constructor(public layoutService: LayoutService) {
    this.layoutService.title.subscribe((title) => (this.title = title));
  }
}
