import { inject, Injectable, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IQuiz, IResponse, ISearch } from "../interfaces";
import { AlertService } from "./alert.service";

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

  getQuizzesByStory(storyId: number) {
    const params = {
      page: this.search.page,
      size: this.search.size,
    };

    this.findAllWithParamsAndCustomSource(`story/${storyId}`, params).subscribe({
      next: (response: IResponse<IQuiz[]>) => {
        this.quizListSignal.set(response.data);
        this.search = { ...this.search, ...response.meta };
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


