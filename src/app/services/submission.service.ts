import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IResponse, ISearch, ISubmission, IAnswer } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class SubmissionService extends BaseService<ISubmission> {
    protected override source: string = 'submissions';
    private submissionSignal = signal<ISubmission | null>(null);
    private resultsSignal = signal<any>(null);

    get submission$() {
        return this.submissionSignal;
    }

    get results$() {
        return this.resultsSignal;
    }

    public search: ISearch = {
        page: 1,
        size: 10,
        pageNumber: 1,
        totalPages: 1,
    };

    public totalItems: number[] = [];
    private alertService: AlertService = inject(AlertService);

    clearSubmission(): void {
        this.submissionSignal.set(null);
        this.resultsSignal.set(null);
    }

    createSubmission(quizId: number, studentId: number) {
        this.http.post<IResponse<ISubmission>>(`${this.source}/quiz/${quizId}/student/${studentId}`, {}).subscribe({
            next: (response: IResponse<ISubmission>) => {
                this.submissionSignal.set(response.data);
                this.alertService.displayAlert(
                    'success',
                    'Quiz iniciado correctamente',
                    'center',
                    'top',
                    ['success-snackbar']
                );
            },
            error: (err: any) => {
                console.error('Error al crear submission', err);

                // Si ya existe una submission, obtenerla en lugar de crear una nueva
                if (err.status === 409) {
                    this.getExistingSubmission(quizId, studentId);
                } else {
                    this.alertService.displayAlert(
                        'error',
                        'Ocurrió un error al iniciar el quiz.',
                        'center',
                        'top',
                        ['error-snackbar']
                    );
                }
            }
        });
    }

    private getExistingSubmission(quizId: number, studentId: number) {
        // Obtener submissions del estudiante y encontrar la del quiz específico
        this.http.get<IResponse<ISubmission[]>>(`${this.source}/student/${studentId}`).subscribe({
            next: (response: IResponse<ISubmission[]>) => {
                const existingSubmission = response.data.find(sub => sub.quiz?.id === quizId);
                if (existingSubmission) {
                    this.submissionSignal.set(existingSubmission);
                    this.alertService.displayAlert(
                        'info',
                        'Continuando con el quiz existente',
                        'center',
                        'top',
                        ['info-snackbar']
                    );
                }
            },
            error: (err: any) => {
                console.error('Error al obtener submission existente', err);
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener el quiz existente.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    submitAnswers(submissionId: number, answers: Array<{ questionId: number, optionId: number }>) {
        this.http.post<IResponse<IAnswer[]>>(`${this.source.replace('submissions', 'answers')}/submission/${submissionId}/bulk`, answers).subscribe({
            next: (response: IResponse<IAnswer[]>) => {
                this.alertService.displayAlert(
                    'success',
                    'Respuestas enviadas correctamente',
                    'center',
                    'top',
                    ['success-snackbar']
                );
                this.getResults(submissionId);
            },
            error: (err: any) => {
                console.error('Error al enviar respuestas', err);
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al enviar las respuestas.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    getResults(submissionId: number) {
        this.http.get<IResponse<any>>(`${this.source.replace('submissions', 'answers')}/submission/${submissionId}/results`).subscribe({
            next: (response: IResponse<any>) => {
                this.resultsSignal.set(response.data);
            },
            error: (err: any) => {
                console.error('Error al obtener resultados', err);
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener los resultados.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }
} 