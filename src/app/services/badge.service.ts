import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { BaseService } from './base-service';
import { IResponse, ISearch, IBadge } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class BadgeService extends BaseService<IBadge> {
  protected override source = 'badges';

  private badgeListSignal: WritableSignal<IBadge[]> = signal<IBadge[]>([]);
  private alertService: AlertService = inject(AlertService);

  public search: ISearch = {
    page: 1,
    size: 10,
    pageNumber: 1,
    totalPages: 1
  };

  get badges$() {
    return this.badgeListSignal;
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
        this.badgeListSignal.set(response.data);
      },
      error: (err) => {
        console.error('Error al obtener insignias:', err);
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al obtener las insignias.',
            'center', 'top',
            ['error-snackbar']
        );
      }
    });
  }

  public save(badge: IBadge) {
    this.add(badge).subscribe({
      next: (response: IResponse<IBadge>) => {
        this.alertService.displayAlert(
            'success',
            response.message || 'Insignia creada correctamente.',
            'center', 'top',
            ['success-snackbar']
        );
        this.getAll();
      },
      error: (err) => {
        console.error('Error al guardar insignia:', err);
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al guardar la insignia.',
            'center', 'top',
            ['error-snackbar']
        );
      }
    });
  }

  public update(badge: IBadge, onSuccess?: () => void) {
    this.http.put<IResponse<IBadge>>(`${this.source}/${badge.id}`, badge).subscribe({
      next: (response: IResponse<IBadge>) => {
        this.alertService.displayAlert(
            'success',
            response.message || 'Insignia actualizada correctamente.',
            'center', 'top',
            ['success-snackbar']
        );
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        console.error('Error al actualizar insignia:', err);
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al actualizar la insignia.',
            'center', 'top',
            ['error-snackbar']
        );
      }
    });
  }

  public delete(badge: IBadge, onSuccess?: () => void) {
    this.delCustomSource(`${badge.id}`).subscribe({
      next: (response: IResponse<IBadge>) => {
        this.alertService.displayAlert(
            'success',
            response.message || 'Insignia eliminada correctamente.',
            'center', 'top',
            ['success-snackbar']
        );
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        console.error('Error al eliminar insignia:', err);
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al eliminar la insignia.',
            'center', 'top',
            ['error-snackbar']
        );
      }
    });
  }

  public assignToStudent(badgeId: number, studentId: number, onSuccess?: () => void) {
    this.http.post<IResponse<IBadge>>(`${this.source}/${badgeId}/students/${studentId}`, {}).subscribe({
      next: (response) => {
        this.alertService.displayAlert(
            'success',
            'Insignia asignada correctamente.',
            'center', 'top',
            ['success-snackbar']
        );
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        console.error('Error al asignar insignia:', err);
        this.alertService.displayAlert(
            'error',
            'No se pudo asignar la insignia.',
            'center', 'top',
            ['error-snackbar']
        );
      }
    });
  }

  public removeFromStudent(badgeId: number, studentId: number, onSuccess?: () => void) {
    this.http.delete<IResponse<IBadge>>(`${this.source}/${badgeId}/students/${studentId}`).subscribe({
      next: (response) => {
        this.alertService.displayAlert(
            'success',
            'Insignia removida correctamente.',
            'center', 'top',
            ['success-snackbar']
        );
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        console.error('Error al remover insignia:', err);
        this.alertService.displayAlert(
            'error',
            'No se pudo remover la insignia.',
            'center', 'top',
            ['error-snackbar']
        );
      }
    });
  }

  public getByStudent(studentId: number) {
    const params = {
      page: this.search.pageNumber ?? 1,
      size: this.search.size ?? 10
    };

    this.http.get<IResponse<IBadge[]>>(`${this.source}/student/${studentId}`, { params }).subscribe({
      next: (response: any) => {
        this.badgeListSignal.set(response.data);
        this.search = {
          ...this.search,
          pageNumber: response.meta.page ?? 1,
          totalPages: response.meta.totalPages ?? 1,
          size: response.meta.size ?? 10
        };
      },
      error: (err) => {
        console.error('Error al obtener insignias del estudiante:', err);
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al obtener las insignias del estudiante.',
            'center', 'top',
            ['error-snackbar']
        );
      }
    });
  }
}
