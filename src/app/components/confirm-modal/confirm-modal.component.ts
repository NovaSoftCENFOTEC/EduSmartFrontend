import { Component, EventEmitter, Input, Output } from '@angular/core';

declare var bootstrap: any; // Importante para que TypeScript reconozca la variable global

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Output() confirmed = new EventEmitter<void>();

  modalId: string = 'confirmModal';

  show(): void {
    const modal = new bootstrap.Modal(document.getElementById(this.modalId));
    modal.show();
  }

  hide(): void {
    const modal = bootstrap.Modal.getInstance(document.getElementById(this.modalId));
    modal.hide();
  }

  confirm(): void {
    this.confirmed.emit();
    this.hide();
  }
}
