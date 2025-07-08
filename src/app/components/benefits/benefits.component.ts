import { Component } from '@angular/core';
import { BENEFITS } from '../../data/benefits.data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './benefits.component.html',
  styleUrl: './benefits.component.scss'
})
export class BenefitsComponent {
  public benefits = BENEFITS;
}
