import { inject, Injectable, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IQuiz, IResponse, ISearch } from "../interfaces";
import { AlertService } from "./alert.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class QuizService extends BaseService<IQuiz> {
  save(item: IQuiz) {
    throw new Error("Method not implemented.");
  }
  protected override source: string = "quizzes"
  private quizListSignal = signal<IQuiz[]>([]);
  private alertService: AlertService = inject(AlertService);

  get quizzes$() {
    return this.quizListSignal;
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
        console.error("Error al obtener los quices", err);
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
        console.error("Error al obtener los quices de la story", err);
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
        console.log('Quiz creado exitosamente:', response);
        this.alertService.displayAlert(
          "success",
          response.message || "Quiz creado con éxito.",
          "center",
          "top",
          ["success-snackbar"]
        );
        this.getQuizzesByStory(storyId);
      },
      error: (err) => {
        console.error('Error completo al crear quiz:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error body:', err.error);

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
        console.error("Error al generar preguntas:", err);
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
        console.error("Error al guardar quiz:", err);
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

    this.edit(item.id, item).subscribe({
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
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al actualizar el quiz.",
          "center",
          "top",
          ["error-snackbar"]
        );
        console.error("Error al actualizar quiz:", err);
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
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al eliminar el quiz.",
          "center",
          "top",
          ["error-snackbar"]
        );
        console.error("Error al eliminar el quiz", err);
      },
    });
  }
}


