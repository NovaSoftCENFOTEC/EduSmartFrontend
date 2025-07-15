import { inject, Injectable, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IStory, ISearch, IResponse } from "../interfaces";
import { AlertService } from "./alert.service";

@Injectable({
  providedIn: "root",
})
export class StoryService extends BaseService<IStory> {
  protected override source = "stories";

  private storyListSignal = signal<IStory[]>([]);

  get stories$() {
    return this.storyListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 10,
    pageNumber: 1,
    totalPages: 1,
  };

  public totalItems: number[] = [];
  private alertService: AlertService = inject(AlertService);
  private currentCourseId: number | null = null;

  setCurrentCourseId(courseId: number | null) {
    this.currentCourseId = courseId;
  }

  getStoriesByCourse(courseId: number) {
    this.setCurrentCourseId(courseId);
    const params = {
      page: this.search.pageNumber ?? 1,
      size: this.search.size ?? 10,
    };

    this.findAllWithParamsAndCustomSource(
      `course/${courseId}/stories`,
      params
    ).subscribe({
      next: (response: any) => {
        this.search = {
          ...this.search,
          pageNumber: response.meta.page ?? 1,
          totalPages: response.meta.totalPages ?? 1,
          size: response.meta.size ?? 10,
        };
        this.totalItems = Array.from(
          { length: this.search.totalPages ?? 0 },
          (_, i) => i + 1
        );
        this.storyListSignal.set(response.data);
      },
      error: (err) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al obtener las historias.",
          "center",
          "top",
          ["error-snackbar"]
        );
        console.error("Error al obtener historias:", err);
      },
    });
  }
  saveStory(courseId: number, story: IStory) {
    const storyWithCourse = {
      ...story,
      course: { id: courseId }, 
    };

    this.addCustomSource(`course/${courseId}`, storyWithCourse).subscribe({
      next: (res: IResponse<IStory>) => {
        this.alertService.displayAlert(
          "success",
          res.message || "Historia agregada correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );
        this.getStoriesByCourse(courseId);
      },
      error: (err) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al agregar la historia.",
          "center",
          "top",
          ["error-snackbar"]
        );
        console.error("Error al guardar historia:", err);
      },
    });
  }

  update(item: IStory, callback: () => void) {
  const itemWithCourse = {
    ...item,
    course: { id: this.currentCourseId! } 
  };

  this.edit(item.id!, itemWithCourse).subscribe({
    next: (response: IResponse<IStory>) => {
      this.alertService.displayAlert(
        "success",
        response.message || "Historia actualizada correctamente.",
        "center",
        "top",
        ["success-snackbar"]
      );
      if (this.currentCourseId) this.getStoriesByCourse(this.currentCourseId);
      callback();
    },
    error: (err: any) => {
      this.alertService.displayAlert(
        "error",
        "Ocurrió un error al actualizar la historia.",
        "center",
        "top",
        ["error-snackbar"]
      );
      console.error("Error al actualizar la historia", err);
    },
  });
}

  delete(item: IStory, callback: () => void) {
    this.del(item.id!).subscribe({
      next: (response: IResponse<IStory>) => {
        this.alertService.displayAlert(
          "success",
          response.message || "Historia eliminada correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );
        if (this.currentCourseId) this.getStoriesByCourse(this.currentCourseId);
        callback();
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al eliminar la historia.",
          "center",
          "top",
          ["error-snackbar"]
        );
        console.error("Error al eliminar la historia", err);
      },
    });
  }
}
