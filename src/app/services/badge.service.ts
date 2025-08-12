import {inject, Injectable, signal} from '@angular/core';
import {BaseService} from './base-service';
import {IBadge, IResponse, ISearch} from '../interfaces';
import {AlertService} from './alert.service';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BadgeService extends BaseService<IBadge> {
    public search: ISearch = {
        page: 1,
        size: 5,
        pageNumber: 1,
        totalPages: 1,
    };
    public totalItems: number[] = [];
    protected override source: string = 'badges';
    private badgeListSignal = signal<IBadge[]>([]);
    private studentBadgesSignal = signal<IBadge[]>([]);
    private alertService: AlertService = inject(AlertService);

    get badges$() {
        return this.badgeListSignal;
    }

    get studentBadges$() {
        return this.studentBadgesSignal;
    }

    clearStudentBadges() {
        this.studentBadgesSignal.set([]);
    }

    getAll() {
        const params = {
            page: this.search.page,
            size: this.search.size
        };

        this.findAllWithParams(params).subscribe({
            next: (response: IResponse<IBadge[]>) => {
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from(
                    {length: this.search.totalPages ?? 0},
                    (_, i) => i + 1
                );
                this.badgeListSignal.set(response.data);
            },
            error: (err: any) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener las insignias.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    save(item: IBadge) {
        this.add(item).subscribe({
            next: (response: IResponse<IBadge>) => {
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Insignia creada correctamente.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
                this.getAll();
            },
            error: (err: any) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al guardar la insignia.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    update(item: IBadge) {
        this.edit(item.id!, item).subscribe({
            next: (response: IResponse<IBadge>) => {
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Insignia actualizada correctamente.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
                this.getAll();
            },
            error: (err: any) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al actualizar la insignia.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    delete(item: IBadge) {
        this.del(item.id!).subscribe({
            next: (response: IResponse<IBadge>) => {
                this.alertService.displayAlert(
                    'success',
                    response.message || 'Insignia eliminada correctamente.',
                    'center',
                    'top',
                    ['success-snackbar']
                );
                this.getAll();
            },
            error: (err: any) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al eliminar la insignia.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    getBadgesByStudent(studentId: number) {
        const params = {
            page: this.search.page,
            size: this.search.size
        };

        this.findAllWithParamsAndCustomSource(`student/${studentId}`, params).subscribe({
            next: (response: IResponse<IBadge[]>) => {
                this.studentBadgesSignal.set(response.data);
                this.search = {...this.search, ...response.meta};
                this.totalItems = Array.from({length: this.search.totalPages || 0}, (_, i) => i + 1);
            },
            error: (err: any) => {
                this.alertService.displayAlert(
                    'error',
                    'Ocurrió un error al obtener las medallas del estudiante.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
            }
        });
    }

    assignBadgeForQuizCompletion(studentId: number, quizId: number, score: number): Observable<IResponse<IBadge | null>> {

        if (score < 69) {
            return new Observable(observer => {
                observer.next({data: null, message: 'Score insuficiente para badge', meta: null});
                observer.complete();
            });
        }


        return new Observable(observer => {

            this.http.get<IResponse<IBadge[]>>(`${this.source}`).subscribe({
                next: (allBadgesResponse: IResponse<IBadge[]>) => {
                    const availableBadges = allBadgesResponse.data || [];

                    if (availableBadges.length === 0) {
                        observer.next({data: null, message: 'No hay badges disponibles', meta: null});
                        observer.complete();
                        return;
                    }


                    this.http.get<IResponse<IBadge[]>>(`${this.source}/student/${studentId}`).subscribe({
                        next: (studentBadgesResponse: IResponse<IBadge[]>) => {
                            const studentBadges = studentBadgesResponse.data || [];
                            const studentBadgeIds = studentBadges.map(badge => badge.id).filter(id => id !== undefined);


                            this.studentBadgesSignal.set(studentBadges);


                            const unassignedBadge = availableBadges.find(badge =>
                                badge.id && !studentBadgeIds.includes(badge.id)
                            );

                            if (!unassignedBadge || !unassignedBadge.id) {
                                observer.next({
                                    data: null,
                                    message: 'Estudiante ya tiene todas las badges disponibles',
                                    meta: null
                                });
                                observer.complete();
                                return;
                            }


                            this.http.post<IResponse<IBadge>>(`${this.source}/${unassignedBadge.id}/students/${studentId}`, {}).subscribe({
                                next: (response: IResponse<IBadge>) => {

                                    this.getBadgesByStudent(studentId);

                                    this.alertService.displayAlert(
                                        'success',
                                        `¡Felicitaciones! Has desbloqueado la medalla "${unassignedBadge.title}" por completar el quiz con ${score}% de aciertos.`,
                                        'center',
                                        'top',
                                        ['success-snackbar']
                                    );
                                    observer.next(response);
                                    observer.complete();
                                },
                                error: (err: any) => {
                                    this.alertService.displayAlert(
                                        'error',
                                        'Error al asignar la medalla automáticamente.',
                                        'center',
                                        'top',
                                        ['error-snackbar']
                                    );
                                    observer.error(err);
                                }
                            });
                        },
                        error: (err: any) => {
                            observer.error(err);
                        }
                    });
                },
                error: (err: any) => {
                    observer.error(err);
                }
            });
        });
    }
}
