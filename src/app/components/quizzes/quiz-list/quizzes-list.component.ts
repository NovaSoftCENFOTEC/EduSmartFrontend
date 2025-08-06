import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IQuiz} from '../../../interfaces';

@Component({
    selector: 'app-quiz-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './quizzes-list.component.html',
    styleUrl: './quizzes-list.component.scss'
})
export class QuizzesListComponent {
    @Input() quizzes: IQuiz[] = [];
    @Output() callModalAction = new EventEmitter<IQuiz>();
    @Output() callViewAction = new EventEmitter<IQuiz>();
    @Output() callGenerateQuestions = new EventEmitter<{ quizId: number, numberOfQuestions: number }>();

    public searchText: string = '';

    get filteredQuizzes(): IQuiz[] {
        if (!this.searchText.trim()) {
            return this.quizzes;
        }
        return this.quizzes.filter(quiz =>
            quiz.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
            quiz.description.toLowerCase().includes(this.searchText.toLowerCase())
        );
    }

    generateQuestions(quizId: number, numberOfQuestions: number = 5): void {
        this.callGenerateQuestions.emit({quizId, numberOfQuestions});
    }

    viewQuiz(quiz: IQuiz): void {
        this.callViewAction.emit(quiz);
    }
}
