import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { BaseService } from "./base-service";
import { IStory, ISearch, IResponse } from "../interfaces";
import { AlertService } from "./alert.service";

@Injectable({
  providedIn: "root",
})
export class StoryService extends BaseService<IStory> {
  protected override source = "stories";

  private storyListSignal: WritableSignal<IStory[]> = signal<IStory[]>([]);
  get stories$() {
    return this.storyListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5,
    pageNumber: 1,
    totalPages: 1,
  };
  public totalItems: number[] = [];
  private currentCourseId: number | null = null;
  private alertService = inject(AlertService);

  setCurrentCourseId(courseId: number | null) {
    this.currentCourseId = courseId;
  }

  public getStoriesByCourse(courseId: number) {
    this.setCurrentCourseId(courseId);
    const params = {
      page: this.search.page,
      size: this.search.size,
    };

    this.findAllWithParamsAndCustomSource(
      `course/${courseId}/stories`,
      params
    ).subscribe({
      next: (response: IResponse<IStory[]>) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
          { length: this.search.totalPages || 0 },
          (_, i) => i + 1
        );
        this.storyListSignal.set(response.data);
      },
      error: () => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al obtener las historias.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  public saveStory(courseId: number, story: IStory, callback?: () => void) {
    const payload = { ...story, course: { id: courseId } };
    this.addCustomSource(`course/${courseId}`, payload).subscribe({
      next: (res: IResponse<IStory>) => {
        this.alertService.displayAlert(
          "success",
          res.message || "Historia agregada correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );
        this.getStoriesByCourse(courseId);
        if (callback) callback();
      },
      error: () => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al agregar la historia.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  public updateStory(item: IStory, callback: () => void) {
    const payload = { ...item, course: { id: this.currentCourseId! } };
    this.edit(item.id!, payload).subscribe({
      next: (res: IResponse<IStory>) => {
        this.alertService.displayAlert(
          "success",
          res.message || "Historia actualizada correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );
        if (this.currentCourseId) this.getStoriesByCourse(this.currentCourseId);
        callback();
      },
      error: () => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al actualizar la historia.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  public deleteStory(item: IStory, callback: () => void) {
    this.del(item.id!).subscribe({
      next: (res: IResponse<IStory>) => {
        this.alertService.displayAlert(
          "success",
          res.message || "Historia eliminada correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );
        if (this.currentCourseId) this.getStoriesByCourse(this.currentCourseId);
        callback();
      },
      error: () => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al eliminar la historia.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }
}
