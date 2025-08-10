import {
    Component,
    inject,
    OnInit,
    ViewChild,
    WritableSignal,
} from "@angular/core";
import {CommonModule} from "@angular/common";
import {PaginationComponent} from "../../components/pagination/pagination.component";
import {ModalComponent} from "../../components/modal/modal.component";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {ModalService} from "../../services/modal.service";
import {AuthService} from "../../services/auth.service";
import {TaskSubmissionService} from "../../services/task-submission.service";
import {ITaskSubmission} from "../../interfaces";
import {
    TaskSubmissionFormComponent
} from "../../components/task-submission/task-submission-form/task-submission-form.component";
import {
    TaskSubmissionListComponent
} from "../../components/task-submission/task-submission-list/task-submission-list.component";

@Component({
    selector: "app-task-submissions",
    standalone: true,
    imports: [
        CommonModule,
        PaginationComponent,
        ModalComponent,
        TaskSubmissionFormComponent,
        TaskSubmissionListComponent,
        ReactiveFormsModule,
    ],
    templateUrl: "./task-submission.component.html",
    styleUrls: ["./task-submission.component.scss"],
})
export class TaskSubmissionsComponent implements OnInit {
    public submissions!: WritableSignal<ITaskSubmission[]>;
    public submissionService = inject(TaskSubmissionService);
    public modalService = inject(ModalService);
    public authService = inject(AuthService);
    public fb = inject(FormBuilder);
    public route = inject(ActivatedRoute);
    public students: { id: number; name: string }[] = [];

    @ViewChild("editSubmissionModal") public editSubmissionModal: any;
    @ViewChild("addSubmissionModal") public addSubmissionModal: any;
    @ViewChild("editConfirmationModal") public editConfirmationModal: any;

    submissionForm = this.fb.group({
        id: [""],
        fileUrl: ["", Validators.required],
        comment: ["", Validators.required],
        assignmentId: [null],
        studentId: [null],
    });

    private assignmentId: number | null = null;
    private originalSubmission: ITaskSubmission | null = null;
    private pendingEditItem: ITaskSubmission | null = null;

    constructor() {
        this.submissions = this.submissionService.submissions$;
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const id = Number(params["assignmentId"]);
            if (id) {
                this.assignmentId = id;
                sessionStorage.setItem("assignmentId", id.toString());
                this.submissionService.setCurrentAssignmentId(id);
            } else {
                const storedId = sessionStorage.getItem("assignmentId");
                this.assignmentId = storedId ? Number(storedId) : null;
                this.submissionService.setCurrentAssignmentId(this.assignmentId);
            }
            this.loadSubmissions();
            this.students = this.submissions().map((s) => ({
                id: s.studentId,
                name: `Estudiante ${s.studentId}`,
            }));
        });
    }

    loadSubmissions(): void {
        if (this.assignmentId) {
            this.submissionService.getByAssignment(this.assignmentId);
        }
    }

    handleAddSubmission(item: { fileUrl: string; comment: string }) {
        if (this.hasSubmissionForAssignment()) {
            alert("Ya has enviado una entrega para esta asignación.");
            return;
        }

        const student = this.authService.getUser();
        const studentId = student?.id;
        const assignmentId = this.assignmentId;

        if (!assignmentId || !studentId) return;

        const payload: ITaskSubmission = {
            fileUrl: item.fileUrl,
            comment: item.comment,
            submittedAt: new Date().toISOString(),
            assignmentId: assignmentId,
            studentId: studentId,
        };

        this.submissionService.save(payload, assignmentId);
        this.modalService.closeAll();
        this.submissionForm.reset();
    }

    updateSubmission() {
        if (!this.originalSubmission) {
            return;
        }

        const payloadToSend: ITaskSubmission = {
            id: this.originalSubmission.id,
            fileUrl: this.submissionForm.controls["fileUrl"].value || "",
            comment: this.submissionForm.controls["comment"].value || "",
            submittedAt: this.originalSubmission.submittedAt,
            assignmentId: this.originalSubmission.assignmentId,
            studentId: this.originalSubmission.studentId,
        };

        this.submissionService.update(payloadToSend, () => {
            this.modalService.closeAll();
            this.submissionForm.reset();
            this.originalSubmission = null;
        });
    }

    deleteSubmission(item: ITaskSubmission) {
        if (!item.id) return;
        this.submissionService.delete(item);
    }

    openEditSubmissionModal(submission: ITaskSubmission) {
        this.originalSubmission = submission;
        this.submissionForm.patchValue({
            id: JSON.stringify(submission.id),
            fileUrl: submission.fileUrl,
            comment: submission.comment,
        });
        this.modalService.displayModal("lg", this.editSubmissionModal);
    }

    openAddSubmissionModal() {
        this.submissionForm.reset();
        this.modalService.displayModal("md", this.addSubmissionModal);
    }

    confirmEdit(item: ITaskSubmission) {
        this.pendingEditItem = item;
        this.originalSubmission = item;
        this.modalService.closeAll();
        this.modalService.displayModal("sm", this.editConfirmationModal);
    }

    cancelEdit() {
        this.pendingEditItem = null;
        this.modalService.closeAll();
        this.modalService.displayModal("lg", this.editSubmissionModal);
    }

    confirmEditFinal() {
        if (this.pendingEditItem) {
            this.updateSubmission();
            this.pendingEditItem = null;
        }
    }

    goBack() {
        window.history.back();
    }

    public get mySubmissions(): ITaskSubmission[] {
        const user = this.authService.getUser();
        if (!user) return [];
        return this.submissions().filter((sub) => sub.studentId === user.id);
    }

    hasSubmissionForAssignment(): boolean {
        const user = this.authService.getUser();
        if (!user || !this.assignmentId) return false;
        return this.submissions().some(
            (sub) =>
                sub.assignmentId === this.assignmentId && sub.studentId === user.id
        );
    }
}
