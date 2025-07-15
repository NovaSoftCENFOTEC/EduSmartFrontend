import {Injectable, inject, signal, WritableSignal} from '@angular/core';
import {BaseService} from './base-service';
import {IUser, ISearch, IResponse} from '../interfaces';
import {AlertService} from './alert.service';
import {TeacherService} from "./teacher.service";
import {AuthService} from "./auth.service";
import {StudentService} from "./student.service";

@Injectable({
    providedIn: 'root',
})
export class UserService extends BaseService<IUser> {
    protected override source = 'users';
    private teacherService: TeacherService = inject(TeacherService);
    private studentService: StudentService = inject(StudentService);


    private userListSignal: WritableSignal<IUser[]> = signal<IUser[]>([]);

    get users$() {
        return this.userListSignal;
    }

    public search: ISearch = {
        page: 1,
        size: 10,
        pageNumber: 1,
        totalPages: 1
    };

    private alertService: AlertService = inject(AlertService);

    public getAll() {
        const params = {
            page: this.search.pageNumber ?? 1,
            size: this.search.size ?? 10
        };

        this.findAllWithParams(params).subscribe({
            next: (response: any) => {
                this.search = {
                    ...this.search,
                    pageNumber: response.meta.page ?? 1,
                    totalPages: response.meta.totalPages ?? 1,
                    size: response.meta.size ?? 10
                };
                this.userListSignal.set(response.data);
            },
            error: (err) => {
                console.error('Error al obtener usuarios:', err);
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener los usuarios.',
                    'center', 'top',
                    ['error-snackbar']
                );
            }
        });
    }

    public save(user: IUser) {
        this.add(user).subscribe({
            next: (response: IResponse<IUser>) => {
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Usuario agregado correctamente.',
                    'center', 'top',
                    ['success-snackbar']
                );
                this.getAll();
            },
            error: (err) => {
                console.error('Error al guardar usuario:', err);
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al agregar el usuario.',
                    'center', 'top',
                    ['error-snackbar']
                );
            }
        });
    }

    public update(user: IUser, onSuccess?: () => void) {
        this.http.put<IResponse<IUser>>(`${this.source}/administrative/${user.id}`, user).subscribe({
            next: (response: IResponse<IUser>) => {
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Usuario actualizado correctamente.',
                    'center', 'top',
                    ['success-snackbar']
                );
                if (onSuccess) {
                    onSuccess();
                }
            },
            error: (err) => {
                console.error('Error al actualizar usuario:', err);
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al actualizar el usuario.',
                    'center', 'top',
                    ['error-snackbar']
                );
            }
        });
    }


    public delete(user: IUser, onSuccess?: () => void) {
        this.delCustomSource(`${user.id}`).subscribe({
            next: (response: IResponse<IUser>) => {
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Usuario eliminado correctamente.',
                    'center', 'top',
                    ['success-snackbar']
                );
                if (onSuccess) {
                    onSuccess();
                }
            },
            error: (err) => {
                console.error('Error al eliminar usuario:', err);
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al eliminar el usuario.',
                    'center', 'top',
                    ['error-snackbar']
                );
            }
        });
    }

}
