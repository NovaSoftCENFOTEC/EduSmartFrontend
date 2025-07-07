import { Injectable, inject, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IUser, ISearch, IResponse } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root',
})
export class TeacherService extends BaseService<IUser> {
  protected override source: string = 'teachers'; // Importante: cambia la source a 'teachers'

  private teacherListSignal = signal<IUser[]>([]);
  private alertService = inject(AlertService);

  public search: ISearch = { page: 1, size: 10 };
  public totalItems: number[] = [];

  public teachers$() {
    return this.teacherListSignal();
  }

  // Aquí solo el método para crear un profesor asignado a escuela (POST /teachers/school/{id})
  saveTeacher(schoolId: number, teacher: IUser) {
    this.addCustomSource(`school/${schoolId}`, teacher).subscribe({
      next: (response: IResponse<IUser>) => {
        this.alertService.displayAlert(
            'success',
            response.message || 'Profesor agregado correctamente.',
            'center',
            'top',
            ['success-snackbar']
        );
        // opcional: si quieres refrescar, hazlo con otro servicio, este controller no tiene get listado
      },
      error: (err) => {
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al agregar el profesor.',
            'center',
            'top',
            ['error-snackbar']
        );
        console.error('Error al guardar profesor:', err);
      }
    });
  }
}
