import {inject, Injectable, signal} from '@angular/core';
import {BaseService} from './base-service';
import {ICourse, IResponse, ISearch} from '../interfaces';
import {AlertService} from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class GroupCoursesService extends BaseService<ICourse> {
    public search: ISearch = {
        page: 1,
        size: 10,
        pageNumber: 1,
        totalPages: 1,
    };
    public totalItems: number[] = [];
    protected override source: string = 'groups';
    private courseListSignal = signal<ICourse[]>([]);
    private alertService: AlertService = inject(AlertService);

    get courses$() {
        return this.courseListSignal;
    }

    clearCourses(): void {
        this.courseListSignal.set([]);
    }


    getCoursesByGroup(groupId: number) {
        this.http.get<IResponse<ICourse>>(`${this.source}/${groupId}/course`).subscribe({
            next: (response: IResponse<ICourse>) => {
                this.courseListSignal.set([response.data]);
                this.search = {
                    ...this.search,
                    totalPages: 1,
                    totalElements: 1
                };
                this.totalItems = [1];
            },
            error: (err: any) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener el curso del grupo.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }
} 