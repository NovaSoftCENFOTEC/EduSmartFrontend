import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { TopbarComponent } from './elements/topbar/topbar.component';
import { SidebarComponent } from './elements/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../services/layout.service';
import { FooterComponent } from "./elements/footer/footer.component";
import { NavbarComponent } from '../navbar/navbar.components';
import { filter } from 'rxjs/operators';

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
    public shouldHideChat: boolean = false;

    constructor(
        public layoutService: LayoutService,
        private router: Router
    ) {
        this.layoutService.title.subscribe((title) => (this.title = title));

        this.router.events.pipe(

            filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe((event) => {
            const hiddenRoutes = [
                //TODO: Add more routes to hide chat
                '/app/chat',
            ];

            this.shouldHideChat = hiddenRoutes.some(route =>
                event.urlAfterRedirects.startsWith(route)
            );
        });
    }
}
