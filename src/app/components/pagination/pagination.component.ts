import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() service: any; // Este 'service' es el objeto ISearch directamente
  @Input() loadFunction: (() => void) | undefined;

  onPage(pPage: number) {
    this.service.pageNumber = pPage; // Accede directamente a pageNumber

    if (this.loadFunction) {
      this.loadFunction();
    }
  }
}