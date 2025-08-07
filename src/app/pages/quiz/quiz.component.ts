import { Component, inject, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, NgIf, DecimalPipe, DatePipe } from '@angular/common';
import { FooterComponent } from '../../components/app-layout/elements/footer/footer.component';
import { QuizService } from '../../services/quiz.service';
import { SubmissionService } from '../../services/submission.service';
import { AuthService } from '../../services/auth.service';
import { IUser } from '../../interfaces';

@Component({
    selector: 'app-quiz',
    standalone: true,
    imports: [
        NgIf,
        FooterComponent,
        AsyncPipe,
        DecimalPipe,
        DatePipe
    ],
    templateUrl: './quiz.component.html',
    styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
    public storyId: number | null = null;
    public currentUser: IUser | null = null;
    public currentQuestionIndex: number = 0;
    public answers: Array<{ questionId: number, optionId: number }> = [];
    public quizStarted: boolean = false;
    public quizCompleted: boolean = false;
    public showQuizSelection: boolean = true;
    public selectedQuizId: number | null = null;

    public route: ActivatedRoute = inject(ActivatedRoute);
    public router = inject(Router);
    public quizService: QuizService = inject(QuizService);
    public submissionService: SubmissionService = inject(SubmissionService);
    public authService: AuthService = inject(AuthService);

    constructor() {
        // Effect para manejar cuando se cargan los quizzes disponibles
        effect(() => {
            const quizzes = this.quizService.availableQuizzes$();
            if (quizzes.length > 0 && this.showQuizSelection) {
                // Si solo hay un quiz, seleccionarlo automáticamente
                if (quizzes.length === 1) {
                    this.selectQuiz(quizzes[0].id!);
                }
            }
        });

        // Effect para manejar cuando se carga el quiz específico
        effect(() => {
            const quiz = this.quizService.quiz$();
            if (quiz && !this.quizStarted && this.selectedQuizId) {
                this.startQuiz();
            }
        });

        // Effect para manejar cuando se completan las respuestas
        effect(() => {
            const results = this.submissionService.results$();
            if (results) {
                this.quizCompleted = true;
            }
        });
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getUser() || null;
        this.route.params.subscribe(params => {
            this.storyId = +params['storyId'];
            if (this.storyId) {
                // Limpiar datos anteriores antes de cargar nuevos
                this.clearPreviousData();
                this.loadAvailableQuizzes();
            }
        });
    }

    clearPreviousData(): void {
        this.quizService.clearQuiz();
        this.quizService.clearAvailableQuizzes();
        this.submissionService.clearSubmission();
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.quizStarted = false;
        this.quizCompleted = false;
        this.showQuizSelection = true;
        this.selectedQuizId = null;
    }

    loadAvailableQuizzes(): void {
        // Cargar todos los quizzes disponibles para esta historia
        this.quizService.getQuizzesByStoryForStudent(this.storyId!);
    }

    selectQuiz(quizId: number): void {
        this.selectedQuizId = quizId;
        this.showQuizSelection = false;
        this.loadSpecificQuiz(quizId);
    }

    loadSpecificQuiz(quizId: number): void {
        // Usar el método que obtiene el quiz completo con preguntas y opciones
        this.quizService.getQuizWithQuestionsAndOptions(quizId).subscribe({
            next: (response: any) => {
                // El signal se actualiza automáticamente a través del effect
                console.log('Quiz cargado:', response.data);
            },
            error: (err: any) => {
                console.error('Error al cargar el quiz completo', err);
            }
        });
    }

    startQuiz(): void {
        if (this.currentUser?.id && this.selectedQuizId) {
            const quiz = this.quizService.quiz$();
            if (quiz) {
                this.submissionService.createSubmission(this.selectedQuizId, this.currentUser.id);
                this.quizStarted = true;
            }
        }
    }

    selectAnswer(questionId: number, optionId: number): void {
        // Actualizar o agregar respuesta
        const existingIndex = this.answers.findIndex(a => a.questionId === questionId);
        if (existingIndex >= 0) {
            this.answers[existingIndex].optionId = optionId;
        } else {
            this.answers.push({ questionId, optionId });
        }
    }

    nextQuestion(): void {
        const quiz = this.quizService.quiz$();
        if (quiz?.questions && this.currentQuestionIndex < quiz.questions.length - 1) {
            this.currentQuestionIndex++;
        }
    }

    previousQuestion(): void {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
        }
    }

    submitQuiz(): void {
        const submission = this.submissionService.submission$();
        if (submission?.id && this.answers.length > 0) {
            this.submissionService.submitAnswers(submission.id, this.answers);
        }
    }

    goBack(): void {
        this.router.navigate(['/app/group-stories']);
    }

    isAnswerSelected(questionId: number, optionId: number): boolean {
        return this.answers.some(a => a.questionId === questionId && a.optionId === optionId);
    }

    getCurrentQuestion() {
        const quiz = this.quizService.quiz$();
        return quiz?.questions?.[this.currentQuestionIndex];
    }

    getProgressPercentage(): number {
        const quiz = this.quizService.quiz$();
        if (!quiz?.questions) return 0;
        return ((this.currentQuestionIndex + 1) / quiz.questions.length) * 100;
    }

    getAvailableQuizzes() {
        return this.quizService.availableQuizzes$();
    }
} 