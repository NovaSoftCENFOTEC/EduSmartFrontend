import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IResponse, ISearch, ISchool } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class SchoolService extends BaseService<ISchool> {
  protected override source: string = 'schools';
  private schoolListSignal = signal<ISchool[]>([]);

  get schools$() {
    return this.schoolListSignal;
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
      next: (response: IResponse<ISchool[]>) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
        console.log("Datos recibidos de la API:", response.data);
        this.schoolListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error al obtener las escuelas', err);
      }
    });
  }

  save(item: ISchool) {
    this.add(item).subscribe({
      next: (response: IResponse<ISchool>) => {
        this.alertService.displayAlert('success', response.message || 'Escuela agregada correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al agregar la escuela.', 'center', 'top', ['error-snackbar']);
        console.error('Error al guardar la escuela', err);
      }
    });
  }

  update(item: ISchool) {
    this.edit(item.id!, item).subscribe({
      next: (response: IResponse<ISchool>) => {
        this.alertService.displayAlert('success', response.message || 'Escuela actualizada correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al actualizar la escuela.', 'center', 'top', ['error-snackbar']);
        console.error('Error al actualizar la escuela', err);
      }
    });
  }

  delete(item: ISchool) {
    this.del(item.id!).subscribe({
      next: (response: IResponse<ISchool>) => {
        this.alertService.displayAlert('success', response.message || 'Escuela eliminada correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al eliminar la escuela.', 'center', 'top', ['error-snackbar']);
        console.error('Error al eliminar la escuela', err);
      }
    });
  }
}
