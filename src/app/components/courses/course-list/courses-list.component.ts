import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ICourse} from "../../../interfaces";
import {ConfirmModalComponent} from "../../confirm-modal/confirm-modal.component";
import {DatePipe} from "@angular/common";
import {RouterModule} from "@angular/router";
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-courses-list',
    standalone: true,
    imports: [
        ConfirmModalComponent,
        DatePipe,
        RouterModule,
        FormsModule
    ],
    templateUrl: './courses-list.component.html',
    styleUrl: './courses-list.component.scss'
})
export class CoursesListComponent {
    @Input() courses: ICourse[] = [];
    @Output() callUpdateModalMethod: EventEmitter<ICourse> = new EventEmitter<ICourse>();
    @Output() callDeleteAction = new EventEmitter<ICourse>();
    @Output() callModalAction = new EventEmitter<ICourse>();

    deleteCourse: ICourse | null = null;
    searchText: string = '';

    @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;


    get filteredCourses(): ICourse[] {
        if (!this.searchText) return this.courses;
        const lower = this.searchText.toLowerCase();
        return this.courses.filter(course =>
            (course.code?.toLowerCase() ?? '').includes(lower) ||
            (course.title?.toLowerCase() ?? '').includes(lower)
        );
    }

    openConfirmationModal(course: ICourse): void {
        this.deleteCourse = course;
        this.confirmDeleteModal.show();
    }

    deleteConfirmation(): void {
        if (this.deleteCourse) {
            this.callDeleteAction.emit(this.deleteCourse);
            this.deleteCourse = null;
        }
    }

}
