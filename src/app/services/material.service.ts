import {inject, Injectable, signal} from '@angular/core';
import {BaseService} from './base-service';
import {AlertService} from './alert.service';
import {IMaterial, IResponse, ISearch} from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class MaterialService extends BaseService<IMaterial> {
    public search: ISearch = {
        page: 1,
        size: 5,
        pageNumber: 1,
        totalPages: 1,
    };
    public totalItems: number[] = [];
    protected override source = 'materials';
    private alertService = inject(AlertService);
    private materialListSignal = signal<IMaterial[]>([]);
    private currentCourseId: number | null = null;
    private currentTeacherId: number | null = null;

    get materials$() {
        return this.materialListSignal;
    }

    setCurrentCourseId(courseId: number | null) {
        this.currentCourseId = courseId;
    }

    setCurrentTeacherId(teacherId: number | null) {
        this.currentTeacherId = teacherId;
    }

    getByCourse(courseId: number) {
        this.setCurrentCourseId(courseId);
        const params = {
            page: this.search.page,
            size: this.search.size,
        };

        this.findAllWithParamsAndCustomSource(`course/${courseId}/materials`, params).subscribe({
            next: (response: IResponse<IMaterial[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from({length: this.search.totalPages ?? 0}, (_, i) => i + 1);
                this.materialListSignal.set(response.data);
            },
            error: () => {
                this.alertService.displayAlert(
                    'error',
                    'Error al obtener los materiales del curso.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    getByTeacher(teacherId: number) {
        this.setCurrentTeacherId(teacherId);
        const params = {
            page: this.search.page,
            size: this.search.size,
        };

        this.findAllWithParamsAndCustomSource(`teacher/${teacherId}/materials`, params).subscribe({
            next: (response: IResponse<IMaterial[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from({length: this.search.totalPages ?? 0}, (_, i) => i + 1);
                this.materialListSignal.set(response.data);
            },
            error: () => {
                this.alertService.displayAlert(
                    'error',
                    'Error al obtener los materiales del profesor.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    save(material: IMaterial, courseId: number, teacherId: number) {
        const customUrl = `course/${courseId}/teacher/${teacherId}`;
        this.addCustomSource(customUrl, material).subscribe({
            next: (response: IResponse<IMaterial>) => {
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Material creado correctamente.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
                this.getByCourse(courseId);
            },
            error: () => {
                this.alertService.displayAlert(
                    'error',
                    'Error al guardar el material.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    update(material: IMaterial, callback?: () => void) {
        this.edit(material.id!, material).subscribe({
            next: (response: IResponse<IMaterial>) => {
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Material actualizado correctamente.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
                if (this.currentCourseId) {
                    this.getByCourse(this.currentCourseId);
                }
                if (callback) callback();
            },
            error: () => {
                this.alertService.displayAlert(
                    'error',
                    'Error al actualizar el material.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    delete(material: IMaterial, callback?: () => void) {
        this.del(material.id!).subscribe({
            next: (response: IResponse<IMaterial>) => {
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Material eliminado correctamente.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
                if (material.course?.id) {
                    this.getByCourse(material.course.id);
                }
                if (callback) callback();
            },
            error: () => {
                this.alertService.displayAlert(
                    'error',
                    'Error al eliminar el material.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }
}
