import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {IOption, IQuestion, IQuiz, IResponse} from "../interfaces";
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: "root",
})
export class QuizDataTransformerService {
    constructor(private http: HttpClient) {
    }

    getQuestionsByQuiz(quizId: number): Observable<IResponse<IQuestion[]>> {
        return this.http.get<IResponse<IQuestion[]>>(`questions/quiz/${quizId}`);
    }

    getOptionsByQuestion(questionId: number): Observable<IResponse<IOption[]>> {
        return this.http.get<IResponse<IOption[]>>(`options/question/${questionId}`);
    }

    getQuizWithQuestionsAndOptions(
        getQuizById: (id: number) => Observable<IResponse<IQuiz>>,
        quizId: number
    ): Observable<IResponse<IQuiz>> {
        return new Observable(observer => {
            getQuizById(quizId).subscribe({
                next: (quizResponse) => {
                    const quiz = quizResponse.data;

                    this.getQuestionsByQuiz(quizId).subscribe({
                        next: (questionsResponse) => {
                            const questions = questionsResponse.data;

                            const optionsObservables = questions.map(question =>
                                this.getOptionsByQuestion(question.id!)
                            );

                            if (optionsObservables.length === 0) {
                                quiz.questions = [];
                                observer.next({data: quiz, message: quizResponse.message, meta: quizResponse.meta});
                                observer.complete();
                                return;
                            }

                            let completedOptions = 0;
                            const questionsWithOptions = [...questions];

                            optionsObservables.forEach((optionsObs, index) => {
                                optionsObs.subscribe({
                                    next: (optionsResponse) => {
                                        questionsWithOptions[index].options = optionsResponse.data;
                                        completedOptions++;
                                        if (completedOptions === optionsObservables.length) {
                                            quiz.questions = questionsWithOptions;
                                            observer.next({
                                                data: quiz,
                                                message: quizResponse.message,
                                                meta: quizResponse.meta
                                            });
                                            observer.complete();
                                        }
                                    },
                                    error: () => {
                                        questionsWithOptions[index].options = [];
                                        completedOptions++;
                                        if (completedOptions === optionsObservables.length) {
                                            quiz.questions = questionsWithOptions;
                                            observer.next({
                                                data: quiz,
                                                message: quizResponse.message,
                                                meta: quizResponse.meta
                                            });
                                            observer.complete();
                                        }
                                    }
                                });
                            });
                        },
                        error: () => {
                            quiz.questions = [];
                            observer.next({data: quiz, message: quizResponse.message, meta: quizResponse.meta});
                            observer.complete();
                        }
                    });
                },
                error: (err) => observer.error(err)
            });
        });
    }

    formatDateForBackend(date: Date | string | null): string {
        if (!date) return new Date().toISOString();
        if (typeof date === 'string') {
            if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return new Date(date + 'T00:00:00').toISOString();
            }
            return date;
        }
        return date.toISOString();
    }
}
