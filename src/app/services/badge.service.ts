import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IResponse, ISearch, IBadge } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class BadgeService extends BaseService<IBadge> {
  protected override source: string = 'badges';

  private badgeListSignal = signal<IBadge[]>([]);
  private alertService: AlertService = inject(AlertService);

  public search: ISearch = {
    page: 1,
    size: 5,
    pageNumber: 1,
    totalPages: 1,
  };

  public totalItems: number[] = [];

  get badges$() {
    return this.badgeListSignal;
  }

  getAll() {
    const params = {
      page: this.search.page,
      size: this.search.size
    };

    this.findAllWithParams(params).subscribe({
      next: (response: IResponse<IBadge[]>) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
            { length: this.search.totalPages ?? 0 },
            (_, i) => i + 1
        );
        this.badgeListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error al obtener insignias', err);
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al obtener las insignias.',
            'center',
            'top',
            ['error-snackbar']
        );
      }
    });
  }

  save(item: IBadge) {
    this.add(item).subscribe({
      next: (response: IResponse<IBadge>) => {
        this.alertService.displayAlert(
            'success',
            response.message || 'Insignia creada correctamente.',
            'center',
            'top',
            ['success-snackbar']
        );
        this.getAll();
      },
      error: (err: any) => {
        console.error('Error al guardar insignia', err);
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al guardar la insignia.',
            'center',
            'top',
            ['error-snackbar']
        );
      }
    });
  }

  update(item: IBadge) {
    this.edit(item.id!, item).subscribe({
      next: (response: IResponse<IBadge>) => {
        this.alertService.displayAlert(
            'success',
            response.message || 'Insignia actualizada correctamente.',
            'center',
            'top',
            ['success-snackbar']
        );
        this.getAll();
      },
      error: (err: any) => {
        console.error('Error al actualizar insignia', err);
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al actualizar la insignia.',
            'center',
            'top',
            ['error-snackbar']
        );
      }
    });
  }

  delete(item: IBadge) {
    this.del(item.id!).subscribe({
      next: (response: IResponse<IBadge>) => {
        this.alertService.displayAlert(
            'success',
            response.message || 'Insignia eliminada correctamente.',
            'center',
            'top',
            ['success-snackbar']
        );
        this.getAll();
      },
      error: (err: any) => {
        console.error('Error al eliminar insignia', err);
        this.alertService.displayAlert(
            'error',
            'Ocurrió un error al eliminar la insignia.',
            'center',
            'top',
            ['error-snackbar']
        );
      }
    });
  }
}
