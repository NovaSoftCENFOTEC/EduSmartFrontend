import { Component } from '@angular/core';
import { TopbarComponent } from '../../components/app-layout/elements/topbar/topbar.component';
import { BenefitsComponent } from '../../components/benefits/benefits.component';
import { FooterComponent } from '../../components/app-layout/elements/footer/footer.component';


@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [TopbarComponent, BenefitsComponent, FooterComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
