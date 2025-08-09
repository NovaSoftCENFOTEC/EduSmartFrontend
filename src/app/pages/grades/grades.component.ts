import {
  Component,
  inject,
  OnInit,
  ViewChild,
  WritableSignal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { ModalComponent } from "../../components/modal/modal.component";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ModalService } from "../../services/modal.service";
import { AuthService } from "../../services/auth.service";
import { GradeService } from "../../services/grade.service";
import { GradesFormComponent} from "../../components/grades/grade-form/grade-form.component";
import { GradesListComponent } from "../../components/grades/grade-list/grade-list.component";
import { IGrade } from "../../interfaces";

@Component({
  selector: "app-grades",
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    ModalComponent,
    GradesFormComponent,
    GradesListComponent,
    ReactiveFormsModule,
  ],
  templateUrl: "./grades.component.html",
  styleUrls: ["./grades.component.scss"],
})
export class GradesComponent implements OnInit {
  public grades!: WritableSignal<IGrade[]>;
  public gradeService = inject(GradeService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  @ViewChild("editGradeModal") public editGradeModal: any;
  @ViewChild("addGradeModal") public addGradeModal: any;
  @ViewChild("editConfirmationModal") public editConfirmationModal: any;

  gradeForm = this.fb.group({
    id: [null as number | null],
    grade: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    justification: ["", Validators.required],
    submissionId: [null as number | null, Validators.required],
    teacherId: [null as number | null, Validators.required],
  });

  private currentSubmissionId: number | null = null;
  private originalGrade: IGrade | null = null;
  private pendingEditItem: IGrade | null = null;

  constructor() {
    this.grades = this.gradeService.grades$;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const submissionId = Number(params["submissionId"]);
      if (submissionId) {
        this.currentSubmissionId = submissionId;
        sessionStorage.setItem("submissionId", submissionId.toString());
        this.gradeService.setCurrentSubmissionId(submissionId);
      } else {
        const storedId = sessionStorage.getItem("submissionId");
        this.currentSubmissionId = storedId ? Number(storedId) : null;
        this.gradeService.setCurrentSubmissionId(this.currentSubmissionId);
      }
      this.loadGrades();
    });
  }

  loadGrades(): void {
    if (this.currentSubmissionId) {
      this.gradeService.getBySubmission(this.currentSubmissionId);
    }
  }

  handleAddGrade(item: {
    grade: number;
    justification: string;
    submissionId: number;
    teacherId: number;
  }) {
    const payload: IGrade = {
      grade: item.grade,
      justification: item.justification,
      submissionId: item.submissionId,
      teacherId: item.teacherId,
    };

    this.gradeService.save(payload, payload.submissionId, payload.teacherId);
    this.modalService.closeAll();
    this.gradeForm.reset();
  }

  updateGrade() {
    if (!this.originalGrade) {
      console.warn("No original grade to update");
      return;
    }

    const payloadToSend: IGrade = {
      id: this.originalGrade.id,
      grade: this.gradeForm.controls["grade"].value!,
      justification: this.gradeForm.controls["justification"].value!,
      submissionId: this.originalGrade.submissionId,
      teacherId: this.originalGrade.teacherId,
      gradedAt: this.originalGrade.gradedAt,
    };

    this.gradeService.update(payloadToSend, () => {
      this.modalService.closeAll();
      this.gradeForm.reset();
      this.originalGrade = null;
    });
  }

  deleteGrade(item: IGrade) {
    if (!item.id) return;
    this.gradeService.delete(item);
  }

  openEditGradeModal(grade: IGrade) {
    this.originalGrade = grade;
    this.gradeForm.patchValue({
      id: grade.id ?? null,
      grade: grade.grade,
      justification: grade.justification,
      submissionId: grade.submissionId,
      teacherId: grade.teacherId,
    });
    this.modalService.displayModal("lg", this.editGradeModal);
  }

  openAddGradeModal() {
  const user = this.authService.getUser();
  const teacherId = user?.id ?? null;

  this.gradeForm.reset();
  this.gradeForm.patchValue({
    submissionId: this.currentSubmissionId,
    teacherId: teacherId,
  });

  this.modalService.displayModal("md", this.addGradeModal);
}
  confirmEdit(item: IGrade) {
    this.pendingEditItem = item;
    this.originalGrade = item;
    this.modalService.closeAll();
    this.modalService.displayModal("sm", this.editConfirmationModal);
  }

  cancelEdit() {
    this.pendingEditItem = null;
    this.modalService.closeAll();
    this.modalService.displayModal("lg", this.editGradeModal);
  }

  confirmEditFinal() {
    if (this.pendingEditItem) {
      this.updateGrade();
      this.pendingEditItem = null;
    }
  }

  goBack() {
    window.history.back();
  }
}
