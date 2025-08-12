import {Component} from '@angular/core';
import {CustomTopbarComponent} from '../../components/app-layout/elements/custom-topbar/custom-topbar.component';

@Component({
    selector: 'app-team-page',
    standalone: true,
    imports: [CustomTopbarComponent],
    templateUrl: './team-page.component.html',
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
