import { Injectable, inject, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IUser } from "../interfaces";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AlertService } from "./alert.service";

@Injectable({
  providedIn: "root",
})
export class ProfileService extends BaseService<IUser> {
  protected override source: string = "users";
  private userSignal = signal<IUser>({});
  private alertService = inject(AlertService);

  get user$() {
    return this.userSignal;
  }

  getUserInfoSignal() {
    this.findAllWithParamsAndCustomSource(`me`).subscribe({
      next: (response: any) => {
        this.userSignal.set(response);
      },
      error: (error: any) => {
        this.alertService.displayAlert(
          "error",
          `Error al obtener la información del usuario: ${error.message}`,
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  updateUser(id: number, data: Partial<IUser>, callback?: () => void) {
    this.edit(id, data).subscribe({
      next: (response: any) => {
        this.userSignal.set(response);
        this.alertService.displayAlert(
          "success",
          "Perfil actualizado correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );
        this.getUserInfoSignal();
        if (callback) callback();
      },
      error: (error: any) => {
        this.alertService.displayAlert(
          "error",
          `Error actualizando perfil: ${error.message}`,
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }

  changePassword(id: number, password: string) {
    this.editCustomSource(`password/${id}`, { password }).subscribe({
      next: () => {
        this.alertService.displayAlert(
          "success",
          "Contraseña actualizada correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );
      },
      error: (error: any) => {
        this.alertService.displayAlert(
          "error",
          `Error al cambiar la contraseña: ${error.message}`,
          "center",
          "top",
          ["error-snackbar"]
        );
      },
    });
  }
}
