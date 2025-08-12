import {Injectable, inject, signal, WritableSignal} from '@angular/core';
import {BaseService} from './base-service';
import {IUser, ISearch, IResponse} from '../interfaces';
import {AlertService} from './alert.service';
import {TeacherService} from './teacher.service';
import {StudentService} from './student.service';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserService extends BaseService<IUser> {
    protected override source = 'users';

    private teacherService = inject(TeacherService);
    private studentService = inject(StudentService);
    private authService = inject(AuthService);
    private alertService = inject(AlertService);

    private userListSignal: WritableSignal<IUser[]> = signal<IUser[]>([]);

    get users$() {
        return this.userListSignal;
    }

    public search: ISearch = {
        page: 1,
        size: 5,
        pageNumber: 1,
        totalPages: 1,
    };
    public totalItems: number[] = [];
    private currentSchoolId: number | null = null;

    setCurrentSchoolId(schoolId: number | null) {
        this.currentSchoolId = schoolId;
    }

    public getAll() {
        const params = {
            page: this.search.page,
            size: this.search.size,
        };

        this.findAllWithParams(params).subscribe({
            next: (response: IResponse<IUser[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from(
                    {length: this.search.totalPages || 0},
                    (_, i) => i + 1
                );
                this.userListSignal.set(response.data);
            },
            error: (err) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener los usuarios.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            },
        });
    }

    public getUsersBySchool(schoolId: number) {
        this.setCurrentSchoolId(schoolId);
        const params = {
            page: this.search.page,
            size: this.search.size,
        };

        this.findAllWithParamsAndCustomSource(`school/${schoolId}/users`, params).subscribe({
            next: (response: IResponse<IUser[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from(
                    {length: this.search.totalPages || 0},
                    (_, i) => i + 1
                );
                this.userListSignal.set(response.data);
            },
            error: (err) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener los usuarios de la escuela.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            },
        });
    }

    public save(user: IUser) {
        const endpoint = this.currentSchoolId
            ? `school/${this.currentSchoolId}`
            : '';
        this.addCustomSource(endpoint, user).subscribe({
            next: (res: IResponse<IUser>) => {
                this.alertService.displayAlert(
                    'success',
                    res.message || 'Usuario agregado correctamente.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
                this.currentSchoolId
                    ? this.getUsersBySchool(this.currentSchoolId)
                    : this.getAll();
            },
            error: (err) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al agregar el usuario.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            },
        });
    }

    public update(user: IUser, onSuccess?: () => void) {
        this.http
            .put<IResponse<IUser>>(`${this.source}/${user.id}`, user)
            .subscribe({
                next: (response: IResponse<IUser>) => {
                    this.alertService.displayAlert(
                        'success',
                        response.message || 'Usuario actualizado correctamente.',
                        'center',
                        'top',
                        ['success-snackbar']
                    );
                    if (onSuccess) onSuccess();
                },
                error: (err) => {
                    this.alertService.displayAlert(
                        'error',
                        'Ocurrió un error al actualizar el usuario.',
                        'center',
                        'top',
                        ['error-snackbar']
                    );
                },
            });
    }

    public delete(user: IUser, onSuccess?: () => void) {
        this.delCustomSource(`${user.id}`).subscribe({
            next: (response: IResponse<IUser>) => {
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Usuario eliminado correctamente.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
                if (onSuccess) onSuccess();
            },
            error: (err) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al eliminar el usuario.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            },
        });
    }

    public passwordRecovery(email: string) {
        return this.editCustomSource(`password-recovery/${email}`, {}).subscribe({
            next: () => {
                this.alertService.displayAlert(
                    'success',
                    'Se envió el enlace de recuperación de contraseña.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
            },
            error: () => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al reestablecer la contraseña.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            },
        });
    }

    public changePassword(userId: string, password: string) {
        return this.editCustomSource(`password/${userId}`, {password}).subscribe({
            next: (response: IResponse<IUser>) => {
                localStorage.setItem('auth_user', JSON.stringify(response.data));
                this.authService['user'] = response.data;
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Contraseña cambiada correctamente.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
            },
            error: () => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al cambiar la contraseña.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            },
        });
    }

    public getByIdAsObservable(userId: number): Observable<IResponse<IUser>> {
        return this.find(userId);
    }

    public getById(userId: number, onSuccess: (user: IUser) => void): void {
        this.find(userId).subscribe({
            next: (response: IResponse<IUser>) => {
                onSuccess(response.data);
            },
            error: () => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener el usuario.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }
}