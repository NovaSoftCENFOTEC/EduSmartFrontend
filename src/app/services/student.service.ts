import {inject, Injectable, signal} from '@angular/core';
import {BaseService} from './base-service';
import {IUser, ISearch, IResponse} from '../interfaces';
import {AlertService} from './alert.service';


@Injectable({
    providedIn: 'root'
})
export class StudentService extends BaseService<IUser> {
    protected override source = 'students';

    private studentListSignal = signal<IUser[]>([]);

    get students$() {
        return this.studentListSignal;
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


    getStudentsBySchool(schoolId: number) {
        this.setCurrentSchoolId(schoolId);
        const params = {
            page: this.search.pageNumber ?? 1,
            size: this.search.size ?? 10
        };


        this.findAllWithParamsAndCustomSource(`school/${schoolId}/students`, params).subscribe({
            next: (response: any) => {
                this.search = {
                    ...this.search,
                    pageNumber: response.meta.page ?? 1,
                    totalPages: response.meta.totalPages ?? 1,
                    size: response.meta.size ?? 10
                };
                this.totalItems = Array.from({length: this.search.totalPages ?? 0}, (_, i) => i + 1);
                this.studentListSignal.set(response.data);
            },
            error: (err) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener los estudiantes.',
                    'center', 'top',
                    ['error-snackbar']
                );
                console.error('Error al obtener estudiantes:', err);
            }
        });
    }


saveStudent(groupId: number, student: IUser) {
    console.log('🔥 StudentService.saveStudentToGroup ejecutado');
    console.log('👥 groupId:', groupId);
    console.log('👨‍🎓 student:', student);
    
    
}
}

