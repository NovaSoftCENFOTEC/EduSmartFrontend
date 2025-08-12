import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ICourse} from '../../../interfaces';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';

@Component({
    selector: 'app-group-courses-list',
    standalone: true,
    imports: [FormsModule, DatePipe],
    templateUrl: './group-courses-list.component.html',
    styleUrl: './group-courses-list.component.scss'
})
export class GroupCoursesListComponent {
    @Input() courses: ICourse[] = [];
    @Output() courseClick = new EventEmitter<number>();

    searchText: string = '';

    get filteredCourses(): ICourse[] {
        if (!this.searchText) return this.courses;
        const lower = this.searchText.toLowerCase();
        return this.courses.filter(c =>
            (c.title?.toLowerCase() ?? '').includes(lower) ||
            (c.code?.toLowerCase() ?? '').includes(lower) ||
            (c.description?.toLowerCase() ?? '').includes(lower)
        );
    }
} 