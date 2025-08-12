import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {IUser} from '../../../interfaces';
import {ConfirmModalComponent} from '../../confirm-modal/confirm-modal.component';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-students-list',
    standalone: true,
    imports: [ConfirmModalComponent, FormsModule],
    templateUrl: './students-list.component.html',
    styleUrls: ['./students-list.component.scss']
})
export class StudentsListComponent {
    @Input() students: IUser[] = [];
    @Input() areActionsAvailable: boolean = false;

    @Output() callModalAction = new EventEmitter<IUser>();
    @Output() callDeleteAction = new EventEmitter<IUser>();

    deleteStudentItem: IUser | null = null;
    searchText: string = '';

    @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

    get filteredStudents(): IUser[] {
        if (!this.searchText) return this.students;
        const lower = this.searchText.toLowerCase();
        return this.students.filter(s =>
            (s.name?.toLowerCase() ?? '').includes(lower) ||
            (s.lastname?.toLowerCase() ?? '').includes(lower) ||
            (s.email?.toLowerCase() ?? '').includes(lower)
        );
    }

    trackById(index: number, item: IUser) {
        return item.id;
    }

    openConfirmationModal(student: IUser): void {
        this.deleteStudentItem = student;
        this.confirmDeleteModal.show();
    }

    deleteConfirmation(): void {
        if (this.deleteStudentItem) {
            this.callDeleteAction.emit(this.deleteStudentItem);
            this.deleteStudentItem = null;
        }
    }
}
