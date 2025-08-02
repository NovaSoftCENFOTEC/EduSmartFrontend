import { inject, Injectable, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IAssignment, IResponse, ISearch } from "../interfaces";
import { AlertService } from "./alert.service";

@Injectable({
  providedIn: "root",
})
export class AssignmentsService extends BaseService<IAssignment> {
  save(item: IAssignment) {
    throw new Error("Method not implemented.");
  }
  getAssignmentsByGroupId(groupId: number) {}
  protected override source: string = "assignments";
  private assignmentListSignal = signal<IAssignment[]>([]);
  private alertService: AlertService = inject(AlertService);

  get assignments$() {
    return this.assignmentListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5,
    pageNumber: 1,
    totalPages: 1,
  };

  public totalItems: any = [];

  getAll() {
    this.findAllWithParams({
      page: this.search.page,
      size: this.search.size,
    }).subscribe({
      next: (response: IResponse<IAssignment[]>) => {
        this.assignmentListSignal.set(response.data);
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
          { length: this.search.totalPages || 0 },
          (_, i) => i + 1
        );
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al obtener las asignaciones.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  getAssignmentsByGroup(groupId: number) {
    const params = {
      page: this.search.page,
      size: this.search.size,
    };

    this.findAllWithParamsAndCustomSource(`group/${groupId}`, params).subscribe(
      {
        next: (response: IResponse<IAssignment[]>) => {
          this.assignmentListSignal.set(response.data);
          this.search = { ...this.search, ...response.meta };
          this.totalItems = Array.from(
            { length: this.search.totalPages || 0 },
            (_, i) => i + 1
          );
        },
        error: (err: any) => {
          this.alertService.displayAlert(
            "error",
            "Ocurrió un error al obtener las asignaciones del grupo.",
            "center",
            "top",
            ["error-snackbar"]
          );
        },
      }
    );
  }

  saveAssignment(item: IAssignment, groupId?: number) {
  if (!item.title || !item.group || !item.group.id) {
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
    next: (response: IResponse<IAssignment>) => {
      this.alertService.displayAlert(
        "success",
        response.message || "Asignación agregada correctamente.",
        "center",
        "top",
        ["success-snackbar"]
      );
      if (groupId) {
        this.getAssignmentsByGroup(groupId);
      } else {
        this.getAll();
      }
    },
    error: (err) => {
      this.alertService.displayAlert(
        "error",
        "Ocurrió un error al agregar la asignación.",
        "center",
        "top",
        ["error-snackbar"]
      );
    },
  });
}

  update(item: IAssignment, groupId?: number) {
    if (!item.id) {
      this.alertService.displayAlert(
        "error",
        "No se puede actualizar una asignación sin ID.",
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
          "Asignación actualizada correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );

        if (groupId) {
          this.getAssignmentsByGroup(groupId);
        } else {
          this.getAll();
        }
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al actualizar la asignación.",
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  delete(item: IAssignment, groupId?: number) {
  this.del(item.id!).subscribe({
    next: (response: IResponse<IAssignment>) => {
      this.alertService.displayAlert(
        "success",
        response.message || "Asignación eliminada correctamente.",
        "center",
        "top",
        ["success-snackbar"]
      );

      if (groupId) {
        this.getAssignmentsByGroup(groupId);
      } else {
        this.getAll();
      }
    },
    error: (err: any) => {
      this.alertService.displayAlert(
        "error",
        "Ocurrió un error al eliminar la asignación.",
        "center",
        "top",
        ["error-snackbar"]
      );
    },
  });
}
}
