import { inject, Injectable, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { AlertService } from "./alert.service";
import { AuthService } from "./auth.service";
import { ITaskSubmission, ISearch, IResponse } from "../interfaces";

@Injectable({ providedIn: "root" })
export class TaskSubmissionService extends BaseService<ITaskSubmission> {
  protected override source = "task-submissions";

  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private submissionListSignal = signal<ITaskSubmission[]>([]);

  public search: ISearch = {
    page: 1,
    size: 5,
    pageNumber: 1,
    totalPages: 1,
  };

  public totalItems: number[] = [];
  private currentAssignmentId: number | null = null;

  get submissions$() {
    return this.submissionListSignal;
  }

  setCurrentAssignmentId(assignmentId: number | null) {
    this.currentAssignmentId = assignmentId;
  }

  getByAssignment(assignmentId: number) {
    this.setCurrentAssignmentId(assignmentId);
    const params = {
      page: this.search.page,
      size: this.search.size,
    };

    this.findAllWithParamsAndCustomSource(
      `assignment/${assignmentId}`,
      params
    ).subscribe({
      next: (response: IResponse<ITaskSubmission[]>) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
          { length: this.search.totalPages ?? 0 },
          (_, i) => i + 1
        );
        this.submissionListSignal.set(response.data);
      },
      error: () => {
        this.alertService.displayAlert(
          "error",
          "Error al obtener entregas.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  save(submission: ITaskSubmission, assignmentId: number) {
    const student = this.authService.getUser();
    const studentId = student?.id;

    if (!assignmentId || !studentId) {
      this.alertService.displayAlert(
        "error",
        "Faltan datos para registrar entrega.",
        "center",
        "top",
        ["error-snackbar"]
      );
      return;
    }

    const payload: ITaskSubmission = {
      ...submission,
      assignmentId: assignmentId,
      studentId: studentId,
      submittedAt: new Date().toISOString(),
    };

    this.add(payload).subscribe({
      next: (response: IResponse<ITaskSubmission>) => {
        this.alertService.displayAlert(
          "success",
          response.message || "Entrega registrada.",
          "center",
          "top",
          ["success-snackbar"]
        );
        this.getByAssignment(assignmentId);
      },
      error: () => {
        this.alertService.displayAlert(
          "error",
          "Error al guardar entrega.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  update(submission: ITaskSubmission, callback?: () => void) {
    this.edit(submission.id!, submission).subscribe({
      next: (response: IResponse<ITaskSubmission>) => {
        this.alertService.displayAlert(
          "success",
          response.message || "Entrega actualizada.",
          "center",
          "top",
          ["success-snackbar"]
        );
        if (this.currentAssignmentId) {
          this.getByAssignment(this.currentAssignmentId);
        }
        if (callback) callback();
      },
      error: () => {
        this.alertService.displayAlert(
          "error",
          "Error al actualizar entrega.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  delete(submission: ITaskSubmission, callback?: () => void) {
    this.del(submission.id!).subscribe({
      next: (response: IResponse<ITaskSubmission>) => {
        this.alertService.displayAlert(
          "success",
          response.message || "Entrega eliminada.",
          "center",
          "top",
          ["success-snackbar"]
        );
        if (submission.assignmentId) {
          this.getByAssignment(submission.assignmentId);
        }
        if (callback) callback();
      },
      error: () => {
        this.alertService.displayAlert(
          "error",
          "Error al eliminar entrega.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  getByStudent(studentId: number): void {
    const params = {
      page: this.search.page,
      size: this.search.size,
    };

    this.findAllWithParamsAndCustomSource(
      `student/${studentId}`,
      params
    ).subscribe({
      next: (response: IResponse<ITaskSubmission[]>) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
          { length: this.search.totalPages ?? 0 },
          (_, i) => i + 1
        );
        this.submissionListSignal.set(response.data);
      },
      error: () => {
        this.alertService.displayAlert(
          "error",
          "Error al obtener entregas del estudiante.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }
}
