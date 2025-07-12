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

        this.groupListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error al obtener los grupos', err);
      }
    });
  }

  save(item: IGroup) {
    console.log('🚀 Item a enviar:', item);
    
    // Construir la URL con los parámetros de curso y profesor
    const courseId = item.course?.id;
    const teacherId = item.teacher?.id;
    
    if (!courseId) {
      this.alertService.displayAlert('error', 'Debe seleccionar un curso.', 'center', 'top', ['error-snackbar']);
      return;
    }
    
    if (!teacherId) {
      this.alertService.displayAlert('error', 'Debe seleccionar un profesor.', 'center', 'top', ['error-snackbar']);
      return;
    }

    // Construir la URL específica que espera el backend
    const customUrl = `${this.source}/course/${courseId}/teacher/${teacherId}`;
    console.log('🔗 URL personalizada:', customUrl);
    
    // Crear el payload simplificado (solo el nombre, sin objetos anidados)
    const payload = {
      name: item.name
    };
    
    console.log('📦 Payload a enviar:', payload);
    
    // Usar el método HTTP directamente con la URL personalizada
    this.http.post<IResponse<IGroup>>(`${this.baseUrl}/${customUrl}`, payload).subscribe({
      next: (response: IResponse<IGroup>) => {
        console.log('✅ Respuesta exitosa:', response);
        this.alertService.displayAlert('success', response.message || 'Grupo agregado correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        console.error('❌ Error completo:', err);
        console.error('❌ URL que falló:', err.url);
        this.alertService.displayAlert('error', 'Ocurrió un error al agregar el grupo.', 'center', 'top', ['error-snackbar']);
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
