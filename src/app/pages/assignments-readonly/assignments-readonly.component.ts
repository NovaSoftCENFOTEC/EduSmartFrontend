import {Component, OnInit, inject} from "@angular/core";
import {CommonModule, Location} from "@angular/common";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {AssignmentsService} from "../../services/assignment.service";
import {IAssignment} from "../../interfaces";
import {PaginationComponent} from "../../components/pagination/pagination.component";
import {AssignmentsListComponent} from "../../components/asignments/assignment-list/assignments-list.component";
import {AuthService} from "../../services/auth.service";

@Component({
    selector: "app-assignments-readonly",
    standalone: true,
    templateUrl: "./assignments-readonly.component.html",
    styleUrls: ["./assignments-readonly.component.scss"],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        PaginationComponent,
        AssignmentsListComponent,
    ],
})
export class AssignmentsReadOnlyComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private location = inject(Location);
    private router = inject(Router);
    private assignmentsService = inject(AssignmentsService);
    private authService = inject(AuthService);

    public assignments = this.assignmentsService.assignments$;
    public searchText = "";
    private groupId: number | null = null;
    public student: { id: number } | null = null;
    public isStudent: boolean = false;
    public isTeacher: boolean = false;

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (user && user.id) {
            this.student = {id: user.id};
            this.isStudent =
                user.authorities?.some((a) => a.authority === "ROLE_STUDENT") ?? false;
            this.isTeacher =
                user.authorities?.some((a) => a.authority === "ROLE_TEACHER") ?? false;
        }

        this.route.queryParams.subscribe((params) => {
            const idFromQuery = Number(params["groupId"]);
            if (idFromQuery) {
                this.setGroupId(idFromQuery);
            } else {
                if (this.assignmentsService["currentGroupId"]) {
                    this.groupId = this.assignmentsService["currentGroupId"];
                    this.assignmentsService.getAssignmentsByGroup(this.groupId);
                } else {
                    const saved = localStorage.getItem("lastGroupId");
                    if (saved) {
                        const fallback = Number(saved);
                        if (fallback) {
                            this.setGroupId(fallback);
                        }
                    }
                }
            }
        });
    }

    private setGroupId(id: number) {
        this.groupId = id;
        this.assignmentsService.setCurrentGroupId(id);
        this.assignmentsService.getAssignmentsByGroup(id);
    }

    goBack(): void {
        this.location.back();
    }

    filteredAssignments(): IAssignment[] {
        const all = this.assignments();
        if (!this.searchText) return all;

        const lower = this.searchText.toLowerCase();

        return all.filter((assignment) => {
            const titleMatch = assignment.title?.toLowerCase().includes(lower);
            const descMatch = assignment.description?.toLowerCase().includes(lower);
            const typeMatch = assignment.type?.toLowerCase().includes(lower);
            const dateMatch = this.convertDateToString(assignment.dueDate)
                .toLowerCase()
                .includes(lower);
            return Boolean(titleMatch || descMatch || typeMatch || dateMatch);
        });
    }

    private convertDateToString(date: Date | string | null): string {
        if (!date) return "";
        if (typeof date === "string") return date;
        return new Date(date).toISOString().split("T")[0];
    }

    SeeDetails(studentId?: number, assignmentId?: number): void {
        if (!studentId) {
            return;
        }
        if (!assignmentId) {
            return;
        }
        this.router.navigate(["app/task-submission"], {
            queryParams: {studentId, assignmentId},
        });
    }
}
