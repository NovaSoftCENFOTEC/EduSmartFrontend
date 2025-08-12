import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {BaseService} from './base-service';
import {IResponse, ISearch, IUser} from '../interfaces';
import {AlertService} from './alert.service';

@Injectable({
    providedIn: 'root',
})
export class StudentService extends BaseService<IUser> {
    public search: ISearch = {
        page: 1,
        size: 5,
        pageNumber: 1,
        totalPages: 1,
    };
    public totalItems: number[] = [];
    protected override source = 'students';
    private studentListSignal: WritableSignal<IUser[]> = signal<IUser[]>([]);
    private currentSchoolId: number | null = null;
    private alertService = inject(AlertService);

    get students$() {
        return this.studentListSignal;
    }

    setCurrentSchoolId(schoolId: number | null) {
        this.currentSchoolId = schoolId;
    }

    public getStudentsBySchool(schoolId: number) {
        this.setCurrentSchoolId(schoolId);
        const params = {
            page: this.search.page,
            size: this.search.size,
        };

        this.findAllWithParamsAndCustomSource(`school/${schoolId}/students`, params).subscribe({
            next: (response: IResponse<IUser[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from(
                    {length: this.search.totalPages || 0},
                    (_, i) => i + 1
                );
                this.studentListSignal.set(response.data);
            },
            error: () => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener los estudiantes.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            },
        });
    }

    public saveStudent(schoolId: number, student: IUser) {
        this.addCustomSource(`school/${schoolId}`, student).subscribe({
            next: (res: IResponse<IUser>) => {
                this.alertService.displayAlert(
                    'success',
                    res.message || 'Estudiante agregado correctamente.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
                this.getStudentsBySchool(schoolId);
            },
            error: () => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al agregar el estudiante.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            },
        });
    }
}
