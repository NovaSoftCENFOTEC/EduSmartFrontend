import {inject, Injectable, signal} from '@angular/core';
import {BaseService} from './base-service';
import {IUser, ISearch, IResponse} from '../interfaces';
import {AlertService} from './alert.service';
import {GroupsService} from './groups.service';
import {HttpClient} from '@angular/common/http';


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
    private groupsService: GroupsService = inject(GroupsService);
    private currentSchoolId: number | null = null;


    setCurrentSchoolId(schoolId: number | null) {
        this.currentSchoolId = schoolId;
    }


saveStudent(groupId: number, student: IUser) {

    if (!student.id) {

        this.alertService.displayAlert(
            'error',
            'El estudiante debe tener un ID válido.',
            'center', 'top',
            ['error-snackbar']
        );
        return;
    }

    const payload = {
        studentId: student.id,
        name: student.name,
        lastname: student.lastname,
        email: student.email
    };

        const correctUrl = `groups/${groupId}/students/${student.id}`;
    this.http.post<IResponse<any>>(correctUrl, payload).subscribe({
        next: (response: IResponse<any>) => {
            console.log('Estudiante creado y agregado al grupo:', response);
            this.alertService.displayAlert(
                'success',
                response.message || 'Estudiante agregado al grupo correctamente.',
                'center', 'top',
                ['success-snackbar']
            );
            this.groupsService.getAll();
        },
        error: (err) => {
            console.error('Error al crear estudiante en el grupo:', err);
            this.alertService.displayAlert(
                'error',
                'Ocurrió un error al agregar el estudiante al grupo.',
                'center', 'top',
                ['error-snackbar']
            );
        }
    });

}

}

