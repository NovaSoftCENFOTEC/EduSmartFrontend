import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IResponse, ISearch, ICourse } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService extends BaseService<ICourse> {
  protected override source: string = 'courses';
  private courseListSignal = signal<ICourse[]>([]);

  get courses$() {
    return this.courseListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5,
    pageNumber: 1,
    totalPages: 1,
  };

  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
      next: (response: IResponse<ICourse[]>) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages ?? 0 }, (_, i) => i + 1);
        this.courseListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error al obtener los cursos', err);
      }
    });
  }

  save(item: ICourse) {
    this.add(item).subscribe({
      next: (response: IResponse<ICourse>) => {
        this.alertService.displayAlert('success', response.message || 'Curso agregado correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al agregar el curso.', 'center', 'top', ['error-snackbar']);
        console.error('Error al guardar el curso', err);
      }
    });
  }

  update(item: ICourse) {
    this.edit(item.id!, item).subscribe({
      next: (response: IResponse<ICourse>) => {
        this.alertService.displayAlert('success', response.message || 'Curso actualizado correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al actualizar el curso.', 'center', 'top', ['error-snackbar']);
        console.error('Error al actualizar el curso', err);
      }
    });
  }

  delete(item: ICourse) {
    this.del(item.id!).subscribe({
      next: (response: IResponse<ICourse>) => {
        this.alertService.displayAlert('success', response.message || 'Curso eliminado correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al eliminar el curso.', 'center', 'top', ['error-snackbar']);
        console.error('Error al eliminar el curso', err);
      }
    });
  }
}
