import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ISchool, IUser} from '../../../interfaces';
import {ConfirmModalComponent} from '../../confirm-modal/confirm-modal.component';
import {DatePipe} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-schools-list',
    standalone: true,
    imports: [
        ConfirmModalComponent,
        DatePipe,
        RouterModule,
        FormsModule
    ],
    templateUrl: './schools-list.component.html',
    styleUrl: './schools-list.component.scss'
})
export class SchoolsListComponent {
    @Input() schools: ISchool[] = [];
    @Output() callUpdateModalMethod: EventEmitter<ISchool> = new EventEmitter<ISchool>();
    @Output() callDeleteAction = new EventEmitter<IUser>();
    @Output() callModalAction = new EventEmitter<IUser>();

    deleteSchool: ISchool | null = null;
    searchText: string = '';

    @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

    get filteredSchools(): ISchool[] {
        if (!this.searchText) return this.schools;
        const lower = this.searchText.toLowerCase();
        return this.schools.filter(s =>
            (s.name?.toLowerCase() ?? '').includes(lower) ||
            (s.domain?.toLowerCase() ?? '').includes(lower)
        );
    }

    openConfirmationModal(school: ISchool): void {
        this.deleteSchool = school;
        this.confirmDeleteModal.show();
    }

    deleteConfirmation(): void {
        if (this.deleteSchool) {
            this.callDeleteAction.emit(this.deleteSchool);
            this.deleteSchool = null;
        }
    }
}
