import {inject, Injectable, signal} from '@angular/core';
import {BaseService} from './base-service';
import {IResponse, ISearch, IGroup} from '../interfaces';
import {AlertService} from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class GroupsService extends BaseService<IGroup> {
    protected override source: string = 'groups';
    private groupListSignal = signal<IGroup[]>([]);
    private alertService: AlertService = inject(AlertService);
    private currentTeacherId: number | null = null;

    get groups$() {
        return this.groupListSignal;
    }

    public search: ISearch = {
        page: 1,
        size: 5,
        pageNumber: 1,
        totalPages: 1,
    };

    public totalItems: any = [];

    getAll() {
        this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
            next: (response: IResponse<IGroup[]>) => {
                this.groupListSignal.set(response.data);
                this.search = { ...this.search, ...response.meta };
                this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
            },
            error: (err: any) => {
                console.error('Error al obtener los grupos', err);
                this.alertService.displayAlert('error', 'Ocurrió un error al obtener los grupos.', 'center', 'top', ['error-snackbar']);
            }
        });
    }

    getGroupsByTeacher(teacherId: number) {
        this.currentTeacherId = teacherId;
        const params = {
            page: this.search.page,
            size: this.search.size
        };

        this.findAllWithParamsAndCustomSource(`teacher/${teacherId}/groups`, params).subscribe({
            next: (response: IResponse<IGroup[]>) => {
                this.groupListSignal.set(response.data);
                this.search = { ...this.search, ...response.meta };
                this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
            },
            error: (err: any) => {
                console.error('Error al obtener grupos del docente', err);
                this.alertService.displayAlert('error', 'Ocurrió un error al obtener los grupos del docente.', 'center', 'top', ['error-snackbar']);
            }
        });
    }

    getById(groupId: number) {
        return this.find(groupId);
    }

    save(item: IGroup) {
        const courseId = item.course?.id;
        const teacherId = item.teacher?.id;

        if (!courseId || !teacherId) {
            this.alertService.displayAlert('error', 'Debe completar los campos obligatorios.', 'center', 'top', ['error-snackbar']);
            return;
        }

        const payload = { name: item.name };

        this.addCustomSource(`course/${courseId}/teacher/${teacherId}`, payload).subscribe({
            next: (response: IResponse<IGroup>) => {
                this.alertService.displayAlert('success', response.message || 'Grupo agregado correctamente.', 'center', 'top', ['success-snackbar']);
                if (this.currentTeacherId) this.getGroupsByTeacher(this.currentTeacherId);
                else this.getAll();
            },
            error: (err) => {
                this.alertService.displayAlert('error', 'Ocurrió un error al agregar el grupo.', 'center', 'top', ['error-snackbar']);
                console.error('Error al guardar grupo:', err);
            }
        });
    }

    update(item: IGroup) {
        if (!item.id) {
            this.alertService.displayAlert('error', 'No se puede actualizar un grupo sin ID.', 'center', 'top', ['error-snackbar']);
            return;
        }

        const payload = {
            name: item.name,
            course: { id: item.course?.id },
            teacher: { id: item.teacher?.id },
            students: item.students || []
        };

        this.edit(item.id, payload).subscribe({
            next: () => {
                this.alertService.displayAlert('success', 'Grupo actualizado correctamente.', 'center', 'top', ['success-snackbar']);
                if (this.currentTeacherId) this.getGroupsByTeacher(this.currentTeacherId);
                else this.getAll();
            },
            error: (err: any) => {
                if (err.status === 500 && err.error?.detail?.includes('Could not write JSON')) {
                    this.alertService.displayAlert('success', 'Grupo actualizado correctamente.', 'center', 'top', ['success-snackbar']);
                    if (this.currentTeacherId) this.getGroupsByTeacher(this.currentTeacherId);
                    else this.getAll();
                } else {
                    this.alertService.displayAlert('error', 'Ocurrió un error al actualizar el grupo.', 'center', 'top', ['error-snackbar']);
                }
            }
        });
    }

    delete(item: IGroup) {
        this.del(item.id!).subscribe({
            next: (response: IResponse<IGroup>) => {
                this.alertService.displayAlert('success', response.message || 'Grupo eliminado correctamente.', 'center', 'top', ['success-snackbar']);
                if (this.currentTeacherId) this.getGroupsByTeacher(this.currentTeacherId);
                else this.getAll();
            },
            error: (err: any) => {
                this.alertService.displayAlert('error', 'Ocurrió un error al eliminar el grupo.', 'center', 'top', ['error-snackbar']);
                console.error('Error al eliminar el grupo', err);
            }
        });
    }

    deleteStudentFromGroup(groupId: number, studentId: number) {
        this.delCustomSource(`${groupId}/students/${studentId}`).subscribe({
            next: (response: IResponse<any>) => {
                this.alertService.displayAlert('success', response.message || 'Estudiante eliminado correctamente.', 'center', 'top', ['success-snackbar']);
                if (this.currentTeacherId) this.getGroupsByTeacher(this.currentTeacherId);
                else this.getAll();
            },
            error: (err: any) => {
                this.alertService.displayAlert('error', 'Error al eliminar el estudiante del grupo.', 'center', 'top', ['error-snackbar']);
            }
        });
    }

    addStudentToGroupByEndpoint(groupId: number, studentId: number) {
        this.addCustomSource(`groups/${groupId}/students/${studentId}`, {}).subscribe({
            next: (response: IResponse<any>) => {
                this.alertService.displayAlert('success', response.message || 'Estudiante agregado correctamente.', 'center', 'top', ['success-snackbar']);
                if (this.currentTeacherId) this.getGroupsByTeacher(this.currentTeacherId);
                else this.getAll();
            },
            error: (err: any) => {
                this.alertService.displayAlert('error', 'Error al agregar el estudiante al grupo.', 'center', 'top', ['error-snackbar']);
            }
        });
    }
}
