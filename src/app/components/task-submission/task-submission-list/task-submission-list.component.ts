import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
} from "@angular/core";
import { ITaskSubmission, IUser } from "../../../interfaces";
import { ConfirmModalComponent } from "../../confirm-modal/confirm-modal.component";
import { DatePipe, NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { StudentService } from "../../../services/student.service";

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
  ],
  templateUrl: "./task-submission-list.component.html",
  styleUrls: ["./task-submission-list.component.scss"],
})
export class TaskSubmissionListComponent implements OnInit {
  @Input() submissions: ITaskSubmission[] = [];
  @Output() callModalAction = new EventEmitter<ITaskSubmission>();
  @Output() callDeleteAction = new EventEmitter<ITaskSubmission>();
  @Output() verDetallesEvent = new EventEmitter<number>();

  deleteSubmission: ITaskSubmission | null = null;
  searchText: string = "";

  isTeacher: boolean = false;
  isStudent: boolean = false;

  studentsMap: Record<number, string> = {};

  @ViewChild("confirmDeleteModal") confirmDeleteModal!: ConfirmModalComponent;

  constructor(
    private router: Router,
    private authService: AuthService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();

    if (user?.role?.name) {
      const roleName = user.role.name.toLowerCase();
      this.isTeacher = roleName === "teacher";
      this.isStudent = roleName === "student";
    }
  }

  getStudentName(studentId?: number): string {
    return studentId
      ? this.studentsMap[studentId] || "Sin nombre"
      : "Sin nombre";
  }

  get filteredSubmissions(): ITaskSubmission[] {
    if (!this.searchText) return this.submissions;
    const lower = this.searchText.toLowerCase();
    return this.submissions.filter(
      (s) =>
        s.comment?.toLowerCase().includes(lower) ||
        this.getStudentName(s.studentId)?.toLowerCase().includes(lower)
    );
  }

  openConfirmationModal(submission: ITaskSubmission): void {
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

  goToTasksGrades(taskSubmissionId: number | undefined): void {
    if (taskSubmissionId !== undefined) {
      this.router.navigate(["/app/grade"], {
        queryParams: { taskSubmissionId: taskSubmissionId.toString() },
      });
    }
  }
}
