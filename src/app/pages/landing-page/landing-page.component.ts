import { Component } from '@angular/core';
import { TopbarComponent } from '../../components/app-layout/elements/topbar/topbar.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [TopbarComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
