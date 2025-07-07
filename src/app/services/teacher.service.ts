import { Injectable, inject } from '@angular/core';
import { BaseService } from './base-service';
import { IUser, IResponse } from '../interfaces';
import { AlertService } from './alert.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class TeacherService extends BaseService<IUser> {
  protected override source = 'teachers';

  private alertService = inject(AlertService);
  private userService  = inject(UserService);

  saveTeacher(schoolId: number, teacher: IUser) {
    this.addCustomSource(`school/${schoolId}`, teacher)
        .subscribe({
          next: (res: IResponse<IUser>) => {
            this.alertService.displayAlert(
                'success',
                res.message || 'Profesor agregado correctamente.',
                'center', 'top',
                ['success-snackbar']
            );
            this.userService.setCurrentSchoolId(schoolId);
            this.userService.refreshList();
          },
          error: (err) => {
            this.alertService.displayAlert(
                'error',
                'Ocurrió un error al agregar el profesor.',
                'center', 'top',
                ['error-snackbar']
            );
            console.error('Error al guardar profesor:', err);
          }
        });
  }
}
