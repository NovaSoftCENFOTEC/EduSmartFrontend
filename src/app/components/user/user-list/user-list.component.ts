import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IUser } from '../../../interfaces';
import { CommonModule } from '@angular/common';

declare var bootstrap: any; // permite usar Bootstrap modal

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  @Input() title: string = '';
  @Input() users: IUser[] = [];
  @Output() callModalAction = new EventEmitter<IUser>();
  @Output() callDeleteAction = new EventEmitter<IUser>();

  usuarioAEliminar: IUser | null = null;

  abrirModalConfirmacion(usuario: IUser): void {
    this.usuarioAEliminar = usuario;
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
    modal.show();
  }

  confirmarEliminacion(): void {
    if (this.usuarioAEliminar) {
      this.callDeleteAction.emit(this.usuarioAEliminar);
    }

    const modalElement = document.getElementById('modalConfirmacion');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  }
}
