import { Component } from '@angular/core';
import { CustomTopbarComponent } from '../../components/app-layout/elements/custom-topbar/custom-topbar.component';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    standalone: true,
    styleUrls: ['./product.component.scss'],
    imports: [CustomTopbarComponent]
})
export class ProductComponent {
    goToLanding() {
        window.location.href = '/landing';
    }

    goToHome() {
        window.location.href = '/';
    }
}
