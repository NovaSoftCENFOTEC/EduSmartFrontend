import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ConfirmModalComponent} from '../../confirm-modal/confirm-modal.component';
import {IGrade} from '../grade-form/grade-form.component';


@Component({
    selector: 'app-grade-list',
    standalone: true,
    imports: [
        ConfirmModalComponent,
        FormsModule
    ],
    templateUrl: './grade-list.component.html',
    styleUrl: './grade-list.component.scss'
})
export class GradesListComponent {
    @Input() grades: IGrade[] = [];
    @Output() callUpdateModalMethod: EventEmitter<IGrade> = new EventEmitter<IGrade>();
    @Output() callDeleteAction = new EventEmitter<IGrade>();
    @Output() callModalAction = new EventEmitter<IGrade>();

    deleteGrade: IGrade | null = null;
    searchText: string = '';

    @ViewChild("confirmDeleteModal") confirmDeleteModal!: ConfirmModalComponent;

    get filteredGrades(): IGrade[] {
        if (!this.searchText) return this.grades;
        const lower = this.searchText.toLowerCase();
        return this.grades.filter(grade =>
            (grade.justification?.toLowerCase() ?? '').includes(lower) ||
            (grade.grade?.toString().includes(lower))
        );
    }

    openConfirmationModal(grade: IGrade): void {
        this.deleteGrade = grade;
        this.confirmDeleteModal.show();
    }

    deleteConfirmation(): void {
        if (this.deleteGrade) {
            this.callDeleteAction.emit(this.deleteGrade);
            this.deleteGrade = null;
        }
    }
}
