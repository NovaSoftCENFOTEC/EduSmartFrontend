import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IResponse, ISearch, IGroup } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class GroupsService extends BaseService<IGroup> {
  protected override source: string = 'groups';
  private groupListSignal = signal<IGroup[]>([]);

  get groups$() {
    return this.groupListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5
  }

  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
      next: (response: IResponse<IGroup[]>) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
        console.log("Datos recibidos de la API:", response.data);
        this.groupListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error al obtener los grupos', err);
      }
    });
  }

  save(item: IGroup) {
    this.add(item).subscribe({
      next: (response: IResponse<IGroup>) => {
        this.alertService.displayAlert('success', response.message || 'Grupo agregado correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al agregar el grupo.', 'center', 'top', ['error-snackbar']);
        console.error('Error al guardar el grupo', err);
      }
    });
  }

  update(item: IGroup) {
    this.edit(item.id!, item).subscribe({
      next: (response: IResponse<IGroup>) => {
        this.alertService.displayAlert('success', response.message || 'Grupo actualizado correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al actualizar el grupo.', 'center', 'top', ['error-snackbar']);
        console.error('Error al actualizar el grupo', err);
      }
    });
  }

  delete(item: IGroup) {
    this.del(item.id!).subscribe({
      next: (response: IResponse<IGroup>) => {
        this.alertService.displayAlert('success', response.message || 'Grupo eliminado correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al eliminar el grupo.', 'center', 'top', ['error-snackbar']);
        console.error('Error al eliminar el grupo', err);
      }
    });
  }
}
