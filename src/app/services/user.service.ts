import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IUser, ISearch } from '../interfaces';
import { AlertService } from './alert.service';
import { WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<IUser> {
  protected override source: string = 'users';

  private userListSignal: WritableSignal<IUser[]> = signal<IUser[]>([]);
  get users$() {
    return this.userListSignal;
  }

  public search: ISearch = { page: 1, size: 10, pageNumber: 1, totalPages: 1 };

  public totalItems: number[] = [];
  private alertService: AlertService = inject(AlertService);

  private currentSchoolId: number | null = null;

  setCurrentSchoolId(schoolId: number | null) {
    this.currentSchoolId = schoolId;
  }

  refreshList() {
    if (this.currentSchoolId !== null) {
      // Si hay un ID de escuela, refresca la lista de profesores de esa escuela
      this.getTeachersBySchool(this.currentSchoolId);
    } else {
      // Si no hay ID de escuela, refresca la lista general de usuarios
      this.getAll();
    }
  }

  getAll() {
    const params = {
      page: this.search.pageNumber ?? 1,
      size: this.search.size ?? 10
    };

    this.findAllWithParams(params).subscribe({
      next: (response: any) => {
        this.search = {
          ...this.search,
          pageNumber: response.meta.page ?? 1,
          totalPages: response.meta.totalPages ?? 1,
          size: response.meta.size ?? 10
        };
        this.userListSignal.set(response.data);
      },
      error: (err) => {
        console.error('Error al obtener usuarios:', err);
      }
    });
  }

  getTeachersBySchool(schoolId: number) {
    this.setCurrentSchoolId(schoolId);

    const params = {
      page: this.search.pageNumber ?? 1,
      size: this.search.size ?? 10
    };

    // La URL para obtener profesores de una escuela específica
    this.findAllWithParamsAndCustomSource(`school/${schoolId}/teachers`, params).subscribe({
      next: (response: any) => {
        this.search = {
          ...this.search,
          pageNumber: response.meta.page ?? 1,
          totalPages: response.meta.totalPages ?? 1,
          size: response.meta.size ?? 10
        };
        this.userListSignal.set(response.data);
      },
      error: (err) => {
        console.error('Error al obtener profesores:', err);
      },
    });
  }

  save(user: IUser) {
    // Usa el método 'add' de BaseService
    this.add(user).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message || 'Usuario agregado correctamente.', 'center', 'top', ['success-snackbar']);
        this.refreshList(); // Refresca la lista después de guardar
      },
      error: (err) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al agregar el usuario.', 'center', 'top', ['error-snackbar']);
        console.error('Error al guardar usuario:', err);
      }
    });
  }

  update(user: IUser) {
    // Usa el método 'editCustomSource' de BaseService (asumiendo que espera el ID en la URL)
    this.editCustomSource(`${user.id}`, user).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message || 'Usuario actualizado correctamente.', 'center', 'top', ['success-snackbar']);
        this.refreshList(); // Refresca la lista después de actualizar
      },
      error: (err) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al actualizar el usuario.', 'center', 'top', ['error-snackbar']);
        console.error('Error al actualizar usuario:', err);
      }
    });
  }

  delete(user: IUser) {
    // Usa el método 'delCustomSource' de BaseService
    this.delCustomSource(`${user.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message || 'Usuario eliminado correctamente.', 'center', 'top', ['success-snackbar']);
        this.refreshList(); // Refresca la lista después de eliminar
      },
      error: (err) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al eliminar el usuario.', 'center', 'top', ['error-snackbar']);
        console.error('Error al eliminar usuario:', err);
      }
    });
  }
}