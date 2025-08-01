import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IResponse, ISearch, IGroup, IStory } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class StudentGroupsService extends BaseService<IGroup> {
    protected override source: string = 'groups';
    private groupListSignal = signal<IGroup[]>([]);
    private storyListSignal = signal<IStory[]>([]);

    get groups$() {
        return this.groupListSignal;
    }

    get stories$() {
        return this.storyListSignal;
    }

    public search: ISearch = {
        page: 1,
        size: 10,
        pageNumber: 1,
        totalPages: 1,
    };

    public totalItems: number[] = [];
    private alertService: AlertService = inject(AlertService);

    getGroupsByStudent(studentId: number) {
        const params = {
            page: this.search.page,
            size: this.search.size,
        };

        this.findAllWithParamsAndCustomSource(`student/${studentId}/groups`, params).subscribe({
            next: (response: IResponse<IGroup[]>) => {
                this.groupListSignal.set(response.data);
                console.log(response.data);
                this.search = { ...this.search, ...response.meta };
                this.totalItems = Array.from(
                    { length: this.search.totalPages || 0 },
                    (_, i) => i + 1
                );
            },
            error: (err: any) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener los grupos del estudiante.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }
} 