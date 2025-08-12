import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IGroup } from '../../../interfaces';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-student-groups-list',
    standalone: true,
    imports: [
        FormsModule
    ],
    templateUrl: './student-groups-list.component.html',
    styleUrl: './student-groups-list.component.scss'
})
export class StudentGroupsListComponent {
    @Input() groups: IGroup[] = [];
    @Output() groupClick = new EventEmitter<number>();

    searchText: string = '';

    constructor(private router: Router) {}


    get filteredGroups(): IGroup[] {
        if (!this.searchText) return this.groups;
        const lower = this.searchText.toLowerCase();
        return this.groups.filter(g =>
            (g.name?.toLowerCase() ?? '').includes(lower) ||
            (g.course?.title?.toLowerCase() ?? '').includes(lower) ||
            (g.teacher?.name?.toLowerCase() ?? '').includes(lower)
        );
    }

    goToMaterials(courseId: number) {
        this.router.navigate(['/app/materials-readonly'], {
            queryParams: { courseId }
        });
    }

    goToAssignments(groupId: number) {
        this.router.navigate(['/app/assignments-readonly'], {
            queryParams: { groupId }
        });
    }
}