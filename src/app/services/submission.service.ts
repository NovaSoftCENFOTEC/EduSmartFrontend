import {Injectable, signal} from "@angular/core";
import {BaseService} from "./base-service";
import {IResponse} from "../interfaces";
import {Observable} from "rxjs";

export interface ISubmission {
    id?: number;
    quiz: { id: number };
    student: { id: number };
    submittedAt?: string;
    score?: number;
}

export interface IAnswer {
    id?: number;
    submission: { id: number };
    question: { id: number };
    selectedOption: { id: number };
}

export interface IAnswerRequest {
    questionId: number;
    optionId: number;
}

export interface ISubmissionResult {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    results: Array<{
        question: string;
        selectedAnswer: string;
        correctAnswer: string;
        correct: boolean;
    }>;
}

@Injectable({
    providedIn: "root",
})
export class SubmissionService extends BaseService<ISubmission> {
    protected override source: string = "submissions";
    private currentSubmissionSignal = signal<ISubmission | null>(null);

    get currentSubmission$() {
        return this.currentSubmissionSignal;
    }

    createSubmission(quizId: number, studentId: number): Observable<IResponse<ISubmission>> {
        const submission: ISubmission = {
            quiz: {id: quizId},
            student: {id: studentId}
        };

        return this.addCustomSource(`quiz/${quizId}/student/${studentId}`, submission);
    }

    getSubmissionById(id: number): Observable<IResponse<ISubmission>> {
        return this.find(id);
    }

    getSubmissionsByQuiz(quizId: number): Observable<IResponse<ISubmission[]>> {
        return this.http.get<IResponse<ISubmission[]>>(`${this.source}/quiz/${quizId}`);
    }

    getSubmissionsByStudent(studentId: number): Observable<IResponse<ISubmission[]>> {
        return this.http.get<IResponse<ISubmission[]>>(`${this.source}/student/${studentId}`);
    }

    createBulkAnswers(submissionId: number, answers: IAnswerRequest[]): Observable<IResponse<IAnswer[]>> {
        return this.http.post<IResponse<IAnswer[]>>(`answers/submission/${submissionId}/bulk`, answers);
    }

    getSubmissionResults(submissionId: number): Observable<IResponse<ISubmissionResult>> {
        return this.http.get<IResponse<ISubmissionResult>>(`answers/submission/${submissionId}/results`);
    }

    updateSubmissionScore(submissionId: number, score: number): Observable<IResponse<ISubmission>> {
        return this.edit(submissionId, {score});
    }

    checkExistingSubmission(quizId: number, studentId: number): Observable<IResponse<ISubmission>> {
        return this.http.get<IResponse<ISubmission>>(`${this.source}/quiz/${quizId}/student/${studentId}/check`);
    }

    setCurrentSubmission(submission: ISubmission | null) {
        this.currentSubmissionSignal.set(submission);
    }

    clearCurrentSubmission() {
        this.currentSubmissionSignal.set(null);
    }

    hasCompletedQuiz(studentId: number, quizId: number): Observable<boolean> {
        return new Observable(observer => {
            this.getSubmissionsByStudent(studentId).subscribe({
                next: (response: any) => {
                    const submission = response.data.find((sub: ISubmission) =>
                        sub.quiz.id === quizId
                    );

                    const hasCompleted = submission && submission.submittedAt;
                    observer.next(hasCompleted);
                    observer.complete();
                },
                error: (err) => {
                    observer.next(false);
                    observer.complete();
                }
            });
        });
    }

    hasStartedQuiz(studentId: number, quizId: number): Observable<ISubmission | null> {
        return new Observable(observer => {
            this.getSubmissionsByStudent(studentId).subscribe({
                next: (response: any) => {
                    const submission = response.data.find((sub: ISubmission) => {
                        return sub.quiz.id === quizId;
                    });

                    observer.next(submission || null);
                    observer.complete();
                },
                error: (err) => {
                    observer.next(null);
                    observer.complete();
                }
            });
        });
    }

    deleteIncompleteSubmission(submissionId: number): Observable<IResponse<ISubmission>> {
        return this.del(submissionId);
    }

    hasAnswers(submissionId: number): Observable<boolean> {
        return new Observable(observer => {
            this.getSubmissionResults(submissionId).subscribe({
                next: (response: any) => {
                    const hasAnswers = response.data.totalQuestions > 0;
                    observer.next(hasAnswers);
                    observer.complete();
                },
                error: () => {
                    observer.next(false);
                    observer.complete();
                }
            });
        });
    }
} 