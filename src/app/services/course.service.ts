import {inject, Injectable, signal} from '@angular/core';
import {BaseService} from './base-service';
import {ICourse, IResponse, ISearch} from '../interfaces';
import {AlertService} from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class CourseService extends BaseService<ICourse> {
    public search: ISearch = {
        page: 1,
        size: 5,
        pageNumber: 1,
        totalPages: 1,
    };
    public totalItems: any = [];
    protected override source: string = 'courses';
    private courseListSignal = signal<ICourse[]>([]);
    private alertService: AlertService = inject(AlertService);

    get courses$() {
        return this.courseListSignal;
    }

    getAll() {
        this.findAllWithParams({page: this.search.page, size: this.search.size}).subscribe({
            next: (response: IResponse<ICourse[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from({length: this.search.totalPages ?? 0}, (_, i) => i + 1);
                this.courseListSignal.set(response.data);
            },
            error: (err: any) => {
                this.alertService.displayAlert('error', 'Ocurrió un error al obtener los cursos.', 'center', 'top', ['error-snackbar']);
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
            }
        });
    }
}
