import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {IUser} from '../../../interfaces';
import {CommonModule} from '@angular/common';
import {ConfirmModalComponent} from '../../confirm-modal/confirm-modal.component';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, ConfirmModalComponent, FormsModule],
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.scss'
})
export class UserListComponent {
    @Input() users: IUser[] = [];
    @Output() callDeleteAction = new EventEmitter<IUser>();
    @Output() callModalAction = new EventEmitter<IUser>();

    usuarioAEliminar: IUser | null = null;
    searchText: string = '';

    @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

    get filteredUsers(): IUser[] {
        if (!this.searchText) return this.users;
        const lower = this.searchText.toLowerCase();
        return this.users.filter(user =>
            (user.name?.toLowerCase() ?? '').includes(lower) ||
            (user.lastname?.toLowerCase() ?? '').includes(lower) ||
            (user.email?.toLowerCase() ?? '').includes(lower)
        );
    }

    abrirModalConfirmacion(usuario: IUser): void {
        if (usuario.email === 'super.admin@gmail.com') return;
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
