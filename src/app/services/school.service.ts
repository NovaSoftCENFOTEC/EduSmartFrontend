import {inject, Injectable, signal} from '@angular/core';
import {BaseService} from './base-service';
import {IResponse, ISchool, ISearch} from '../interfaces';
import {AlertService} from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class SchoolService extends BaseService<ISchool> {
    public search: ISearch = {
        page: 1,
        size: 5,
        pageNumber: 1,
        totalPages: 1,
    };
    public totalItems: any = [];
    protected override source: string = 'schools';
    private schoolListSignal = signal<ISchool[]>([]);
    private alertService: AlertService = inject(AlertService);

    get schools$() {
        return this.schoolListSignal;
    }

    getAll() {
        this.findAllWithParams({page: this.search.page, size: this.search.size}).subscribe({
            next: (response: IResponse<ISchool[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages : 0}, (_, i) => i + 1);
                this.schoolListSignal.set(response.data);
            },
            error: (err: any) => {
                this.alertService.displayAlert('error', 'Ocurrió un error al obtener las escuelas.', 'center', 'top', ['error-snackbar']);
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
            }
        });
    }
}
