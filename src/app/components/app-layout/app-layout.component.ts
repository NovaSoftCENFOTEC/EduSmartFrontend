import {Component, OnInit} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {TopbarComponent} from './elements/topbar/topbar.component';
import {SidebarComponent} from './elements/sidebar/sidebar.component';
import {CommonModule} from '@angular/common';
import {LayoutService} from '../../services/layout.service';
import {FooterComponent} from "./elements/footer/footer.component";
import {NavbarComponent} from '../navbar/navbar.components';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        TopbarComponent,
        FooterComponent,
        NavbarComponent,
        RouterLink
    ],
    templateUrl: './app-layout.component.html',
    styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
    public title?: string;

    constructor(public layoutService: LayoutService) {
        this.layoutService.title.subscribe((title) => (this.title = title));
    }

}
