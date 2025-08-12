import {inject, Injectable, signal} from "@angular/core";
import {BaseService} from "./base-service";
import {AlertService} from "./alert.service";
import {AuthService} from "./auth.service";
import {IGrade, IGradePayload, IResponse, ISearch} from "../interfaces";
import {map} from "rxjs/operators";

@Injectable({providedIn: "root"})
export class GradeService extends BaseService<IGrade> {
    public search: ISearch = {
        page: 1,
        size: 5,
        pageNumber: 1,
        totalPages: 1,
    };
    public totalItems: number[] = [];
    protected override source = "grades";
    private alertService = inject(AlertService);
    private authService = inject(AuthService);
    private gradeListSignal = signal<IGrade[]>([]);
    private currentSubmissionId: number | null = null;

    get grades$() {
        return this.gradeListSignal;
    }

    setCurrentSubmissionId(submissionId: number | null) {
        this.currentSubmissionId = submissionId;
    }

    getAll() {
        const params = {page: this.search.page, size: this.search.size};
        this.findAllWithParams(params).subscribe({
            next: (response: IResponse<IGrade[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from(
                    {length: this.search.totalPages ?? 0},
                    (_, i) => i + 1
                );
                this.gradeListSignal.set(response.data);
            },
            error: () => {
                this.alertService.displayAlert(
                    "error",
                    "Error al obtener calificaciones.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
            },
        });
    }

    getBySubmission(submissionId: number) {
        this.setCurrentSubmissionId(submissionId);
        const params = {page: this.search.page, size: this.search.size};
        this.findAllWithParamsAndCustomSource(
            `submission/${submissionId}`,
            params
        ).subscribe({
            next: (response: IResponse<IGrade[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from(
                    {length: this.search.totalPages ?? 0},
                    (_, i) => i + 1
                );
                this.gradeListSignal.set(response.data);
            },
            error: () => {
                this.alertService.displayAlert(
                    "error",
                    "Error al obtener calificaciones por entrega.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
            },
        });
    }

    getByStudent(studentId: number) {
        const params = {page: this.search.page, size: this.search.size};
        this.findAllWithParamsAndCustomSource(
            `student/${studentId}`,
            params
        ).subscribe({
            next: (response: IResponse<IGrade[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from(
                    {length: this.search.totalPages ?? 0},
                    (_, i) => i + 1
                );
                this.gradeListSignal.set(response.data);
            },
            error: () => {
                this.alertService.displayAlert(
                    "error",
                    "Error al obtener calificaciones del estudiante.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
            },
        });
    }
    
    checkIfGradeExists(submissionId: number) {
        const params = {page: 1, size: 1000};
        return this.findAllWithParamsAndCustomSource(
            `submission/${submissionId}`,
            params
        ).pipe(
            map((response: IResponse<IGrade[]>) => {
                return response.data.some((g) => g.submission?.id === submissionId);
            })
        );
    }

    save(grade: IGrade, submissionId: number, teacherId: number) {
        if (!submissionId || !teacherId) {
            this.alertService.displayAlert(
                "error",
                "Faltan datos para registrar calificación.",
                "center",
                "top",
                ["error-snackbar"]
            );
            return;
        }

        this.checkIfGradeExists(submissionId).subscribe((exists) => {
            if (exists) {
                this.alertService.displayAlert(
                    "warning",
                    "Ya existe una calificación para esta entrega.",
                    "center",
                    "top",
                    ["warning-snackbar"]
                );
                return;
            }

            const payload: IGradePayload = {
                grade: grade.grade,
                justification: grade.justification,
                gradedAt: new Date().toISOString(),
                submission: {id: submissionId},
                teacher: {id: teacherId},
            };

            this.add(payload as unknown as IGrade).subscribe({
                next: (response: IResponse<IGrade>) => {
                    this.alertService.displayAlert(
                        "success",
                        response.message || "Calificación registrada.",
                        "center",
                        "top",
                        ["success-snackbar"]
                    );
                    if (this.currentSubmissionId)
                        this.getBySubmission(this.currentSubmissionId);
                },
                error: () => {
                    this.alertService.displayAlert(
                        "error",
                        "Error al registrar calificación.",
                        "center",
                        "top",
                        ["error-snackbar"]
                    );
                },
            });
        });
    }

    update(grade: IGrade, callback?: () => void) {
        if (!grade.id) {
            this.alertService.displayAlert(
                "error",
                "El ID de la calificación es obligatorio para actualizar.",
                "center",
                "top",
                ["error-snackbar"]
            );
            return;
        }

        this.edit(grade.id, grade).subscribe({
            next: (response: IResponse<IGrade>) => {
                this.alertService.displayAlert(
                    "success",
                    response.message || "Calificación actualizada.",
                    "center",
                    "top",
                    ["success-snackbar"]
                );
                if (this.currentSubmissionId)
                    this.getBySubmission(this.currentSubmissionId);
                if (callback) callback();
            },
            error: () => {
                this.alertService.displayAlert(
                    "error",
                    "Error al actualizar calificación.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
            },
        });
    }

    delete(grade: IGrade, callback?: () => void) {
        if (!grade.id) {
            this.alertService.displayAlert(
                "error",
                "El ID de la calificación es obligatorio para eliminar.",
                "center",
                "top",
                ["error-snackbar"]
            );
            return;
        }

        this.del(grade.id).subscribe({
            next: (response: IResponse<IGrade>) => {
                this.alertService.displayAlert(
                    "success",
                    response.message || "Calificación eliminada.",
                    "center",
                    "top",
                    ["success-snackbar"]
                );
                if (this.currentSubmissionId)
                    this.getBySubmission(this.currentSubmissionId);
                if (callback) callback();
            },
            error: () => {
                this.alertService.displayAlert(
                    "error",
                    "Error al eliminar calificación.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
            },
        });
    }
}
