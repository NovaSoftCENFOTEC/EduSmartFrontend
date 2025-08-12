import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {IUser} from '../../../interfaces';
import {ConfirmModalComponent} from '../../confirm-modal/confirm-modal.component';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-teachers-list',
    standalone: true,
    imports: [ConfirmModalComponent, RouterModule, FormsModule],
    templateUrl: './teachers-list.component.html',
    styleUrl: './teachers-list.component.scss'
})
export class TeachersListComponent {
    @Input() teachers: IUser[] = [];
    @Output() callUpdateModalMethod: EventEmitter<IUser> = new EventEmitter<IUser>();
    @Output() callDeleteAction = new EventEmitter<IUser>();
    @Output() callModalAction = new EventEmitter<IUser>();

    deleteTeacher: IUser | null = null;
    searchText: string = '';

    @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

    get filteredTeachers(): IUser[] {
        if (!this.searchText) return this.teachers;
        const lower = this.searchText.toLowerCase();
        return this.teachers.filter(t =>
            (t.name?.toLowerCase() ?? '').includes(lower) ||
            (t.lastname?.toLowerCase() ?? '').includes(lower) ||
            (t.email?.toLowerCase() ?? '').includes(lower)
        );
    }

    openConfirmationModal(teacher: IUser): void {
        this.deleteTeacher = teacher;
        this.confirmDeleteModal.show();
    }

    deleteConfirmation(): void {
        if (this.deleteTeacher) {
            this.callDeleteAction.emit(this.deleteTeacher);
            this.deleteTeacher = null;
        }
    }
}
