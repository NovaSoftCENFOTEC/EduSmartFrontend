import {inject, Injectable, signal} from '@angular/core';
import {BaseService} from './base-service';
import {IUser, ISearch, IResponse} from '../interfaces';
import {AlertService} from './alert.service';


@Injectable({
    providedIn: 'root'
})
export class TeacherService extends BaseService<IUser> {
    protected override source = 'teachers';


    private teacherListSignal = signal<IUser[]>([]);

    get teachers$() {
        return this.teacherListSignal;
    }


    public search: ISearch = {
        page: 1,
        size: 10,
        pageNumber: 1,
        totalPages: 1
    };


    public totalItems: number[] = [];
    private alertService: AlertService = inject(AlertService);
    private currentSchoolId: number | null = null;


    setCurrentSchoolId(schoolId: number | null) {
        this.currentSchoolId = schoolId;
    }


    getTeachersBySchool(schoolId: number) {
        this.setCurrentSchoolId(schoolId);
        const params = {
            page: this.search.pageNumber ?? 1,
            size: this.search.size ?? 10
        };


        this.findAllWithParamsAndCustomSource(`school/${schoolId}/teachers`, params).subscribe({
            next: (response: any) => {
                this.search = {
                    ...this.search,
                    pageNumber: response.meta.page ?? 1,
                    totalPages: response.meta.totalPages ?? 1,
                    size: response.meta.size ?? 10
                };
                this.totalItems = Array.from({length: this.search.totalPages ?? 0}, (_, i) => i + 1);
                this.teacherListSignal.set(response.data);
            },
            error: (err) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener los profesores.',
                    'center', 'top',
                    ['error-snackbar']
                );
                console.error('Error al obtener profesores:', err);
            }
        });
    }


    saveTeacher(schoolId: number, teacher: IUser) {
        this.addCustomSource(`school/${schoolId}`, teacher).subscribe({
            next: (res: IResponse<IUser>) => {
                this.alertService.displayAlert(
                    'success',
                    res.message || 'Profesor agregado correctamente.',
                    'center', 'top',
                    ['success-snackbar']
                );
                this.getTeachersBySchool(schoolId);
            },
            error: (err) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al agregar el profesor.',
                    'center', 'top',
                    ['error-snackbar']
                );
                console.error('Error al guardar profesor:', err);
            }
        });
    }
}

