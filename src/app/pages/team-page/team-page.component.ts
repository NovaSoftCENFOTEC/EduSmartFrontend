import {Component} from '@angular/core';

@Component({
    selector: 'app-team-page',
    templateUrl: './team-page.component.html',
    standalone: true,
    styleUrls: ['./team-page.component.scss']
})
export class TeamPageComponent {

    goToAbout() {
        window.location.href = '/landing#about';
    }

    goToHome() {
        const el = document.getElementById('home');
        if (el) {
            el.scrollIntoView({behavior: 'smooth'});
            history.replaceState(null, '', window.location.pathname);
        }
    }

    goToProduct() {
        window.location.href = '/product';
    }

    goToMisionVision() {
        window.location.href = '/landing#vision-mision';
    }
}
