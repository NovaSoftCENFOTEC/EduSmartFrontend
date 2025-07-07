import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { BaseService } from './base-service';
import { IUser, ISearch, IResponse } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<IUser> {
  protected override source = 'users';

  private userListSignal: WritableSignal<IUser[]> = signal<IUser[]>([]);
  get users$() {
    return this.userListSignal;
  }

  public search: ISearch = { page: 1, size: 10, pageNumber: 1, totalPages: 1 };
  private alertService: AlertService = inject(AlertService);
  private currentSchoolId: number | null = null;

  public setCurrentSchoolId(schoolId: number | null) {
    this.currentSchoolId = schoolId;
  }

  public refreshList() {
    if (this.currentSchoolId !== null) {
      this.getTeachersBySchool(this.currentSchoolId);
    } else {
      this.getAll();
    }
  }

  public getAll() {
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

  public getTeachersBySchool(schoolId: number) {
    this.setCurrentSchoolId(schoolId);
    const params = {
      page: this.search.pageNumber ?? 1,
      size: this.search.size ?? 10
    };
    this.findAllWithParamsAndCustomSource(`school/${schoolId}/teachers`, params)
        .subscribe({
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
          }
        });
  }

  public save(user: IUser) {
    this.add(user).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert(
            'success',
            response.message || 'Usuario agregado correctamente.',
            'center', 'top',
            ['success-snackbar']
        );
        this.refreshList();
      },
      error: (err) => {
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al agregar el usuario.',
            'center', 'top',
            ['error-snackbar']
        );
        console.error('Error al guardar usuario:', err);
      }
    });
  }

  public update(user: IUser) {
    this.editCustomSource(`${user.id}`, user).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert(
            'success',
            response.message || 'Usuario actualizado correctamente.',
            'center', 'top',
            ['success-snackbar']
        );
        this.refreshList();
      },
      error: (err) => {
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al actualizar el usuario.',
            'center', 'top',
            ['error-snackbar']
        );
        console.error('Error al actualizar usuario:', err);
      }
    });
  }

  public delete(user: IUser) {
    this.delCustomSource(`${user.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert(
            'success',
            response.message || 'Usuario eliminado correctamente.',
            'center', 'top',
            ['success-snackbar']
        );
        this.refreshList();
      },
      error: (err) => {
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al eliminar el usuario.',
            'center', 'top',
            ['error-snackbar']
        );
        console.error('Error al eliminar usuario:', err);
      }
    });
  }
}
