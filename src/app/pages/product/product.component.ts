import {Component} from '@angular/core';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    standalone: true,
    styleUrls: ['./product.component.scss']
})
export class ProductComponent {
    goToLanding() {
        window.location.href = '/landing';
    }

    goToHome() {
        window.location.href = '/';
    }
}
