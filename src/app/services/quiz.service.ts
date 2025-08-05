import { inject, Injectable, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IQuiz, IResponse, ISearch, IQuestion, IOption } from "../interfaces";
import { AlertService } from "./alert.service";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class QuizService extends BaseService<IQuiz> {
  save(item: IQuiz) {
    throw new Error("Method not implemented.");
  }

  protected override source: string = "quizzes";

  private quizListSignal = signal<IQuiz[]>([]);
  private alertService: AlertService = inject(AlertService);
  private quizCreatedSubject = new Subject<void>();
  private quizUpdatedSubject = new Subject<void>();
  private quizDeletedSubject = new Subject<void>();

  get quizzes$() {
    return this.quizListSignal;
  }

  get quizCreated$() {
    return this.quizCreatedSubject.asObservable();
  }

  get quizUpdated$() {
    return this.quizUpdatedSubject.asObservable();
  }

  get quizDeleted$() {
    return this.quizDeletedSubject.asObservable();
  }

  public search: ISearch = {
    page: 1,
    size: 5,
  };

  public totalItems: any = [];

  getAll() {
    this.findAllWithParams({
      page: this.search.page,
      size: this.search.size,
    }).subscribe({
      next: (response: IResponse<IQuiz[]>) => {
        this.quizListSignal.set(response.data);
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
          { length: this.search.totalPages || 0 },
          (_, i) => i + 1
        );
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al obtener los quices.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  getQuizById(id: number): Observable<IResponse<IQuiz>> {
    return this.find(id);
  }

  getQuizzesByStory(storyId: number) {
    this.findAllWithParams({
      page: this.search.page,
      size: 1000,
    }).subscribe({
      next: (response: IResponse<IQuiz[]>) => {
        const filteredQuizzes = response.data.filter(quiz =>
          quiz.story && quiz.story.id === storyId
        );
        this.quizListSignal.set(filteredQuizzes);
        this.search = {
          ...this.search,
          totalPages: Math.ceil(filteredQuizzes.length / (this.search.size || 5)),
          totalElements: filteredQuizzes.length
        };
        this.totalItems = Array.from(
          { length: this.search.totalPages || 0 },
          (_, i) => i + 1
        );
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al obtener los quices de la story.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  getQuestionsByQuiz(quizId: number): Observable<IResponse<IQuestion[]>> {
    return this.http.get<IResponse<IQuestion[]>>(`questions/quiz/${quizId}`);
  }

  getOptionsByQuestion(questionId: number): Observable<IResponse<IOption[]>> {
    return this.http.get<IResponse<IOption[]>>(`options/question/${questionId}`);
  }

  getQuizWithQuestionsAndOptions(quizId: number): Observable<IResponse<IQuiz>> {
    return new Observable(observer => {
      this.getQuizById(quizId).subscribe({
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
                observer.next({
                  data: quiz,
                  message: quizResponse.message,
                  meta: quizResponse.meta
                });
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
                  error: (err) => {
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
            error: (err) => {
              quiz.questions = [];
              observer.next({
                data: quiz,
                message: quizResponse.message,
                meta: quizResponse.meta
              });
              observer.complete();
            }
          });
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  createQuizForStory(quiz: IQuiz, storyId: number) {
    if (!quiz.title || !quiz.description) {
      this.alertService.displayAlert(
        "error",
        "Debe completar los campos obligatorios.",
        "center",
        "top",
        ["error-snackbar"]
      );
      return;
    }

    const quizData = {
      title: quiz.title,
      description: quiz.description,
      dueDate: this.formatDateForBackend(quiz.dueDate),
      numberOfQuestions: quiz.numberOfQuestions || 5,
      generateWithAI: quiz.generateWithAI || false
    };

    this.addCustomSource(`story/${storyId}`, quizData).subscribe({
      next: (response: IResponse<IQuiz>) => {

        let successMessage = response.message || "Quiz creado con éxito.";
        if (quizData.generateWithAI && quizData.numberOfQuestions > 0) {
          successMessage += ` Se generaron ${quizData.numberOfQuestions} preguntas automáticamente con IA.`;
        }

        this.alertService.displayAlert(
          "success",
          successMessage,
          "center",
          "top",
          ["success-snackbar"]
        );
        this.getQuizzesByStory(storyId);
        this.quizCreatedSubject.next();
      },
      error: (err) => {
        let errorMessage = "Ocurrió un error al crear el quiz.";
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.alertService.displayAlert(
          "error",
          errorMessage,
          "center",
          "top",
          ["error-snackbar"]
        );
        this.quizCreatedSubject.next();
      },
    });
  }

  private formatDateForBackend(date: Date | string | null): string {
    if (!date) return new Date().toISOString();
    if (typeof date === 'string') {
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(date + 'T00:00:00').toISOString();
      }
      return date;
    }
    return date.toISOString();
  }

  generateQuestionsForQuiz(quizId: number, numberOfQuestions: number) {
    this.addCustomSource(`${quizId}/generate-questions?numberOfQuestions=${numberOfQuestions}`, {}).subscribe({
      next: (response: IResponse<any>) => {
        this.alertService.displayAlert(
          "success",
          response.message || "Preguntas generadas con éxito.",
          "center",
          "top",
          ["success-snackbar"]
        );

        this.getQuizById(quizId).subscribe({
          next: (quizResponse) => {
            const currentQuizzes = this.quizListSignal();
            const updatedQuizzes = currentQuizzes.map(q =>
              q.id === quizId ? quizResponse.data : q
            );
            this.quizListSignal.set(updatedQuizzes);
          }
        });
      },
      error: (err) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al generar las preguntas.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  saveQuiz(item: IQuiz, storyId?: number) {
    if (!item.title || !item.story || !item.story.id) {
      this.alertService.displayAlert(
        "error",
        "Debe completar los campos obligatorios.",
        "center",
        "top",
        ["error-snackbar"]
      );
      return;
    }

    this.add(item).subscribe({
      next: (response: IResponse<IQuiz>) => {
        this.alertService.displayAlert(
          "success",
          response.message || "Quiz agregado correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );
        if (storyId) {
          this.getQuizzesByStory(storyId);
        } else {
          this.getAll();
        }
      },
      error: (err) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al agregar el quiz.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  update(item: IQuiz, storyId?: number) {
    if (!item.id) {
      this.alertService.displayAlert(
        "error",
        "No se puede actualizar un quiz sin ID.",
        "center",
        "top",
        ["error-snackbar"]
      );
      return;
    }
    const quizData = {
      ...item,
      dueDate: this.formatDateForBackend(item.dueDate)
    };

    this.edit(item.id, quizData).subscribe({
      next: () => {
        this.alertService.displayAlert(
          "success",
          "Quiz actualizado correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );

        if (storyId) {
          this.getQuizzesByStory(storyId);
        } else {
          this.getAll();
        }
        this.quizUpdatedSubject.next();
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al actualizar el quiz.",
          "center",
          "top",
          ["error-snackbar"]
        );
        this.quizUpdatedSubject.next();
      },
    });
  }

  delete(item: IQuiz, storyId?: number) {
    this.del(item.id!).subscribe({
      next: (response: IResponse<IQuiz>) => {
        this.alertService.displayAlert(
          "success",
          response.message || "Quiz eliminado correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );

        if (storyId) {
          this.getQuizzesByStory(storyId);
        } else {
          this.getAll();
        }
        this.quizDeletedSubject.next();
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al eliminar el quiz.",
          "center",
          "top",
          ["error-snackbar"]
        );
        this.quizDeletedSubject.next();
      },
    });
  }
}


