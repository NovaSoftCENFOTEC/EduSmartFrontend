import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IResponse, ISearch, IStory } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class GroupStoriesService extends BaseService<IStory> {
    protected override source: string = 'stories';
    private storyListSignal = signal<IStory[]>([]);

    get stories$() {
        return this.storyListSignal;
    }

    public search: ISearch = {
        page: 1,
        size: 10,
        totalPages: 1,
        pageNumber: 1,
    };

    public totalItems: number[] = [];
    private alertService: AlertService = inject(AlertService);

    clearStories(): void {
        this.storyListSignal.set([]);
    }

    getStoriesByCourse(courseId: number) {
        this.findAllWithParamsAndCustomSource(`course/${courseId}/stories`, {}).subscribe({
            next: (response: IResponse<IStory[]>) => {
                this.storyListSignal.set(response.data);
                this.search = {
                    ...this.search,
                    totalPages: 1,
                    totalElements: response.data.length
                };
                this.totalItems = [1];
            },
            error: (err: any) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener las historias del curso.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }
} 