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
        size: 5,
        pageNumber: 1,
        totalPages: 1,
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
            page: this.search.page,
            size: this.search.size
        };

        this.findAllWithParamsAndCustomSource(`school/${schoolId}/teachers`, params).subscribe({
            next: (response: IResponse<IUser[]>) => {
                this.teacherListSignal.set(response.data);
                this.search = { ...this.search, ...response.meta };
                this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
            },
            error: (err) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener los profesores.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
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
            }
        });
    }
}

