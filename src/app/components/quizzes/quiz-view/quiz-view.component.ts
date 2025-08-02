import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IQuiz, IQuestion, IOption } from '../../../interfaces';
import { QuizService } from '../../../services/quiz.service';
import { AlertService } from '../../../services/alert.service';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
    selector: 'app-quiz-view',
    standalone: true,
    imports: [
        CommonModule,
        LoaderComponent
    ],
    templateUrl: './quiz-view.component.html',
    styleUrl: './quiz-view.component.scss'
})
export class QuizViewComponent implements OnInit {
    @Input() quizId: number | null = null;
    @Output() closeModal = new EventEmitter<void>();

    public quizService = inject(QuizService);
    public alertService = inject(AlertService);

    public quiz: IQuiz | null = null;
    public isLoading: boolean = false;
    public questions: IQuestion[] = [];

    ngOnInit(): void {
        if (this.quizId) {
            this.loadQuizWithQuestions();
        }
    }

    loadQuizWithQuestions() {
        if (!this.quizId) return;

        this.isLoading = true;

        this.quizService.getQuizWithQuestionsAndOptions(this.quizId).subscribe({
            next: (response) => {
                this.quiz = response.data;
                this.questions = response.data.questions || [];
                this.isLoading = false;
            },
            error: (err) => {
                this.alertService.displayAlert(
                    "error",
                    "Error al cargar el quiz con sus preguntas.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
                this.isLoading = false;
            }
        });
    }

    getCorrectOptions(question: IQuestion): IOption[] {
        return question.options?.filter(option => option.correct) || [];
    }

    getIncorrectOptions(question: IQuestion): IOption[] {
        return question.options?.filter(option => !option.correct) || [];
    }

    onClose() {
        this.closeModal.emit();
    }
} 