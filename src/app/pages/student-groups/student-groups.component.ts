import {Component, inject, OnInit} from '@angular/core';
import {PaginationComponent} from '../../components/pagination/pagination.component';
import {IGroup, IUser} from '../../interfaces';
import {StudentGroupsService} from '../../services/student-groups.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {
    StudentGroupsListComponent
} from "../../components/student-groups/student-groups-list/student-groups-list.component";
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-student-groups',
    standalone: true,
    imports: [
        PaginationComponent,
        StudentGroupsListComponent,
        NgIf
    ],
    templateUrl: './student-groups.component.html',
    styleUrl: './student-groups.component.scss'
})
export class StudentGroupsComponent implements OnInit {
    public groupList: IGroup[] = [];
    public studentGroupsService: StudentGroupsService = inject(StudentGroupsService);
    public authService: AuthService = inject(AuthService);
    public route: ActivatedRoute = inject(ActivatedRoute);
    public router = inject(Router);
    public currentStudent: IUser | null = null;

    ngOnInit(): void {
        localStorage.removeItem('currentGroupId');
        this.currentStudent = this.authService.getUser() || null;
        if (this.currentStudent && this.currentStudent.id) {
            this.loadGroups();
        }
    }

    loadGroups(): void {
        if (this.currentStudent?.id) {
            this.studentGroupsService.getGroupsByStudent(this.currentStudent.id);
        }
    }

    goToGroupStories(groupId: number): void {
        this.router.navigate(['/app/group-by-student-id', groupId, 'courses']);
    }

    goBack() {
        window.history.back();
    }
} 