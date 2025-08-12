import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import {ITaskSubmission} from "../../../interfaces";
import {ConfirmModalComponent} from "../../confirm-modal/confirm-modal.component";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {forkJoin, map, Observable, of} from "rxjs";
import {catchError} from "rxjs/operators";

@Component({
    selector: "app-task-submission-list",
    standalone: true,
    imports: [
        ConfirmModalComponent,
        NgForOf,
        NgIf,
        FormsModule,
        RouterModule,
        DatePipe,
        AsyncPipe,
        NgClass,
    ],
    templateUrl: "./task-submission-list.component.html",
    styleUrls: ["./task-submission-list.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskSubmissionListComponent implements OnInit, OnChanges {
    @Input() submissions: ITaskSubmission[] = [];
    @Output() callModalAction = new EventEmitter<ITaskSubmission>();
    @Output() callDeleteAction = new EventEmitter<ITaskSubmission>();
    @Output() verDetallesEvent = new EventEmitter<number>();

    deleteSubmission: ITaskSubmission | null = null;
    searchText: string = "";
    isTeacher: boolean = false;
    isStudent: boolean = false;

    studentsMap$: Observable<Record<number, string>> | undefined;

    @ViewChild("confirmDeleteModal") confirmDeleteModal!: ConfirmModalComponent;

    constructor(
        private router: Router,
        private authService: AuthService,
        private userService: UserService
    ) {
    }

    get filteredSubmissions(): ITaskSubmission[] {
        if (!this.searchText) return this.submissions;
        const lower = this.searchText.toLowerCase();

        return this.submissions.filter((s) =>
            s.comment?.toLowerCase().includes(lower)
        );
    }

    ngOnInit() {
        const user = this.authService.getUser();
        if (user?.role?.name) {
            const roleName = user.role.name.toLowerCase();
            this.isTeacher = roleName === "teacher";
            this.isStudent = roleName === "student";
        }

        this.computeStudentsMap();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["submissions"]) {
            this.computeStudentsMap();
        }
    }

    openConfirmationModal(submission: ITaskSubmission): void {
        if (this.isTeacher) return;
        this.deleteSubmission = submission;
        this.confirmDeleteModal.show();
    }

    deleteConfirmation(): void {
        if (this.deleteSubmission) {
            this.callDeleteAction.emit(this.deleteSubmission);
            this.deleteSubmission = null;
        }
    }

    trackById(index: number, item: ITaskSubmission) {
        return item.id;
    }

    getFileIcon(fileUrl: string): string {
        const fileExtension = fileUrl.split(".").pop()?.toLowerCase();
        switch (fileExtension) {
            case "pdf":
                return "fas fa-file-pdf";
            case "doc":
            case "docx":
                return "fas fa-file-word";
            case "xls":
            case "xlsx":
                return "fas fa-file-excel";
            case "ppt":
            case "pptx":
                return "fas fa-file-powerpoint";
            case "txt":
                return "fas fa-file-alt";
            case "zip":
            case "rar":
                return "fas fa-file-archive";
            default:
                return "fas fa-file";
        }
    }

    getFileColorClass(fileUrl: string): string {
        const ext = fileUrl.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return 'color-pdf';
            case 'doc':
            case 'docx':
                return 'color-word';
            case 'xls':
            case 'xlsx':
                return 'color-excel';
            case 'ppt':
            case 'pptx':
                return 'color-powerpoint';
            default:
                return 'color-default';
        }
    }


    goToTasksGrades(taskSubmissionId: number | undefined): void {
        if (taskSubmissionId !== undefined) {
            this.router.navigate(["/app/grade"], {
                queryParams: {taskSubmissionId: taskSubmissionId.toString()},
            });
        }
    }

    private computeStudentsMap(): void {
        const user = this.authService.getUser();

        if (this.isStudent && user) {
            const studentName = user.name || "Sin nombre";

            const studentIds = Array.from(
                new Set(
                    this.submissions
                        .map((s) => s.studentId)
                        .filter((id): id is number => id !== undefined)
                )
            );

            const map: Record<number, string> = {};
            studentIds.forEach((id) => {
                map[id] = studentName;
            });

            this.studentsMap$ = of(map);
            return;
        }
        const studentIds = Array.from(
            new Set(
                this.submissions
                    .map((s) => s.studentId)
                    .filter((id): id is number => id !== undefined)
            )
        );

        if (studentIds.length > 0) {
            const studentObservables = studentIds.map((id) =>
                this.userService.getByIdAsObservable(id).pipe(
                    map((response) => ({id, name: response.data?.name || "Sin nombre"})),
                    catchError(() => of({id, name: "Sin nombre"}))
                )
            );

            this.studentsMap$ = forkJoin(studentObservables).pipe(
                map((results) => {
                    const studentsMap: Record<number, string> = {};
                    results.forEach((result) => {
                        studentsMap[result.id] = result.name || "Sin nombre";
                    });
                    return studentsMap;
                })
            );
        } else {
            this.studentsMap$ = of({});
        }
    }

    isExpired(date: string | Date): boolean {
        if (!date) return false;
        const today = new Date();
        const due = new Date(date);
        return due.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
    }

}
