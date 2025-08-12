import {Component, effect, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DecimalPipe} from '@angular/common';
import {QuizService} from '../../services/quiz.service';
import {AuthService} from '../../services/auth.service';
import {IAnswerRequest, ISubmission, ISubmissionResult, SubmissionService} from '../../services/submission.service';
import {BadgeService} from '../../services/badge.service';
import {IQuiz, IUser} from '../../interfaces';

@Component({
    selector: 'app-student-quiz',
    standalone: true,
    imports: [
        DecimalPipe
    ],
    templateUrl: './student-quiz.component.html',
    styleUrl: './student-quiz.component.scss'
})
export class StudentQuizComponent implements OnInit {
    public storyId: number | null = null;
    public quizId: number | null = null;
    public currentUser: IUser | null = null;
    public currentQuestionIndex: number = 0;
    public answers: Array<{ questionId: number, optionId: number }> = [];
    public quizStarted: boolean = false;
    public quizCompleted: boolean = false;
    public isLoading: boolean = false;
    public isSubmitting: boolean = false;
    public results: ISubmissionResult | null = null;
    public currentSubmission: ISubmission | null = null;
    public quizData: IQuiz | null = null;

    public route: ActivatedRoute = inject(ActivatedRoute);
    public router = inject(Router);
    public quizService: QuizService = inject(QuizService);
    public authService: AuthService = inject(AuthService);
    public submissionService: SubmissionService = inject(SubmissionService);
    public badgeService: BadgeService = inject(BadgeService);

    constructor() {
        effect(() => {
            const quiz = this.quizService.quizzes$();
            if (quiz.length > 0 && this.quizId) {
                const currentQuiz = quiz.find(q => q.id === this.quizId);
                if (currentQuiz && !this.quizStarted) {
                    this.quizData = currentQuiz;
                    this.checkAndStartQuiz();
                }
            }
        });
        effect(() => {
            const submission = this.submissionService.currentSubmission$();
            if (submission) {
                this.currentSubmission = submission;
            }
        });
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getUser() || null;
        this.route.params.subscribe(params => {
            this.storyId = +params['storyId'];
            this.quizId = +params['quizId'];
            if (this.storyId && this.quizId) {
                this.loadQuiz();
            }
        });
    }

    loadQuiz(): void {
        this.isLoading = true;
        this.quizService.getQuizWithQuestionsAndOptions(this.quizId!).subscribe({
            next: (response: any) => {
                this.quizData = response.data;
                this.isLoading = false;
                this.checkAndStartQuiz();
            },
            error: (err: any) => {
                this.isLoading = false;
            }
        });
    }

    checkAndStartQuiz(): void {
        if (!this.currentUser?.id || !this.quizId || !this.quizData) {
            return;
        }

        this.submissionService.hasStartedQuiz(this.currentUser.id, this.quizId).subscribe({
            next: (existingSubmission: ISubmission | null) => {
                if (existingSubmission) {
                    this.submissionService.getSubmissionResults(existingSubmission.id!).subscribe({
                        next: (resultsResponse: any) => {
                            if (resultsResponse.data.totalQuestions > 0 && existingSubmission.submittedAt) {
                                this.loadExistingSubmission(existingSubmission);
                            } else {
                                this.currentSubmission = existingSubmission;
                                this.submissionService.setCurrentSubmission(existingSubmission);
                                this.quizStarted = true;
                            }
                        },
                        error: (err) => {
                            this.currentSubmission = existingSubmission;
                            this.submissionService.setCurrentSubmission(existingSubmission);
                            this.quizStarted = true;
                        }
                    });
                } else {
                    this.createNewSubmission();
                }
            },
            error: (err: any) => {
                this.createNewSubmission();
            }
        });
    }

    createNewSubmission(): void {
        if (!this.currentUser?.id || !this.quizId) return;

        this.submissionService.createSubmission(this.quizId, this.currentUser.id).subscribe({
            next: (response: any) => {
                this.currentSubmission = response.data;
                this.submissionService.setCurrentSubmission(response.data);
                this.quizStarted = true;
            },
            error: (err: any) => {
                if (err.status === 409 && this.currentUser?.id && this.quizId) {
                    this.submissionService.hasStartedQuiz(this.currentUser.id, this.quizId).subscribe({
                        next: (existingSubmission: ISubmission | null) => {
                            if (existingSubmission) {
                                this.loadExistingSubmission(existingSubmission);
                            }
                        }
                    });
                } else {
                    this.forceCreateSubmission();
                }
            },
        });
    }

    clearIncompleteSubmission(): void {
        if (!this.currentSubmission?.id) return;

        this.submissionService.deleteIncompleteSubmission(this.currentSubmission.id).subscribe({
            next: (response: any) => {
                this.submissionService.clearCurrentSubmission();
                this.currentSubmission = null;
                this.quizCompleted = false;
                this.results = null;
                this.createNewSubmission();
            },
            error: (err: any) => {
                this.forceCreateSubmission();
            }
        });
    }

    forceCreateSubmission(): void {
        if (!this.currentUser?.id || !this.quizId) return;

        this.currentSubmission = {
            id: Date.now(),
            quiz: {id: this.quizId},
            student: {id: this.currentUser.id}
        };
        this.submissionService.setCurrentSubmission(this.currentSubmission);
        this.quizStarted = true;
    }

    loadExistingSubmission(submission: ISubmission): void {
        this.currentSubmission = submission;
        this.submissionService.setCurrentSubmission(submission);
        this.quizCompleted = true;

        this.submissionService.getSubmissionResults(submission.id!).subscribe({
            next: (response: any) => {
                this.results = response.data;
            }
        });
    }

    selectAnswer(questionId: number, optionId: number): void {
        if (this.quizCompleted) return;

        const existingIndex = this.answers.findIndex(a => a.questionId === questionId);
        if (existingIndex >= 0) {
            this.answers[existingIndex].optionId = optionId;
        } else {
            this.answers.push({questionId, optionId});
        }
    }

    nextQuestion(): void {
        if (this.quizData?.questions && this.currentQuestionIndex < this.quizData.questions.length - 1) {
            this.currentQuestionIndex++;
        }
    }

    previousQuestion(): void {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
        }
    }

    submitQuiz(): void {
        if (this.answers.length === 0 || !this.currentSubmission?.id) return;

        this.isSubmitting = true;

        const answerRequests: IAnswerRequest[] = this.answers.map(answer => ({
            questionId: answer.questionId,
            optionId: answer.optionId
        }));

        this.submissionService.createBulkAnswers(this.currentSubmission.id, answerRequests).subscribe({
            next: (response: any) => {

                this.submissionService.getSubmissionResults(this.currentSubmission!.id!).subscribe({
                    next: (resultsResponse: any) => {
                        this.results = resultsResponse.data;
                        this.quizCompleted = true;
                        this.isSubmitting = false;

                        if (this.currentUser?.id && this.quizId && this.results && this.results.score >= 70) {
                            this.badgeService.assignBadgeForQuizCompletion(
                                this.currentUser.id,
                                this.quizId,
                                this.results.score
                            ).subscribe({
                                next: () => {
                                },
                                error: () => {
                                }
                            });
                        }
                    },
                    error: (err: any) => {
                        this.isSubmitting = false;
                    }
                });
            },
            error: (err: any) => {
                this.isSubmitting = false;
            }
        });
    }

    goBack(): void {
        const storedGroupId = localStorage.getItem('currentGroupId');

        if (storedGroupId && this.storyId) {
            this.router.navigate(['/app/group-by-student-id', +storedGroupId, 'courses']);
        } else {
            this.router.navigate(['/app/story', this.storyId, 'quizzes']);
        }
    }

    isAnswerSelected(questionId: number, optionId: number): boolean {
        return this.answers.some(a => a.questionId === questionId && a.optionId === optionId);
    }

    getCurrentQuestion() {
        return this.quizData?.questions?.[this.currentQuestionIndex];
    }

    getCurrentQuiz(): IQuiz | null {
        return this.quizData;
    }

    getProgressPercentage(): number {
        if (!this.quizData?.questions) return 0;
        return ((this.currentQuestionIndex + 1) / this.quizData.questions.length) * 100;
    }
} 