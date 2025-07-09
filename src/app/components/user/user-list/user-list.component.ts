import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IUser } from '../../../interfaces';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  @Input() users: IUser[] = [];
  @Output() callDeleteAction = new EventEmitter<IUser>();
  @Output() callModalAction = new EventEmitter<IUser>();

  usuarioAEliminar: IUser | null = null;

  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

  abrirModalConfirmacion(usuario: IUser): void {
    this.usuarioAEliminar = usuario;
    this.confirmDeleteModal.show();
  }

  confirmarEliminacion(): void {
    if (this.usuarioAEliminar) {
      this.callDeleteAction.emit(this.usuarioAEliminar);
      this.usuarioAEliminar = null;
    }
  }
}

