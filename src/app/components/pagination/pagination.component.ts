import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() service: any;
  @Input() loadFunction: (() => void) | undefined;

  pageInput: number | null = null;

  onPage(pPage: number) {

    if (pPage < 1 || pPage > (this.service.totalPages || 1)) return;

    this.service.page = pPage;
    this.service.pageNumber = pPage; // sincroniza ambas

    if (this.loadFunction) {
      this.loadFunction();
    }

    this.pageInput = null; // limpia input
  }

  goToPage() {
    if (this.pageInput == null) return;

    const page = Math.floor(this.pageInput);
    if (page >= 1 && page <= (this.service.totalPages || 1)) {
      this.onPage(page);
    } else {
      alert(`Por favor ingresa un número entre 1 y ${this.service.totalPages}`);
    }
  }
}
