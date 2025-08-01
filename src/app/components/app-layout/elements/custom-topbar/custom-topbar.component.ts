import { Component } from '@angular/core';

@Component({
  selector: 'app-custom-topbar',
  standalone: true,
  templateUrl: './custom-topbar.component.html',
  styleUrls: ['./custom-topbar.component.scss']
})
export class CustomTopbarComponent {
  goToLanding() {
    window.location.href = '/landing';
  }
}
