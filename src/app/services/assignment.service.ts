import {inject, Injectable, signal} from "@angular/core";
import {BaseService} from "./base-service";
import {IAssignment, IResponse, ISearch} from "../interfaces";
import {AlertService} from "./alert.service";

@Injectable({
    providedIn: "root",
})
export class AssignmentsService extends BaseService<IAssignment> {
    public isLoading = signal<boolean>(false);
    public search: ISearch = {
        page: 1,
        size: 5,
        pageNumber: 1,
        totalPages: 1,
    };
    public totalItems: number[] = [];
    protected override source: string = "assignments";
    private alertService = inject(AlertService);
    private assignmentListSignal = signal<IAssignment[]>([]);
    private currentGroupId: number | null = null;

    constructor() {
        super();

        const saved = localStorage.getItem("lastGroupId");
        if (saved) {
            const parsed = Number(saved);
            if (!isNaN(parsed)) {
                this.currentGroupId = parsed;
            }
        }
    }

    get assignments$() {
        return this.assignmentListSignal;
    }

    setCurrentGroupId(groupId: number | null) {
        this.currentGroupId = groupId;
        if (groupId !== null) {
            localStorage.setItem("lastGroupId", groupId.toString());
        } else {
            localStorage.removeItem("lastGroupId");
        }
    }

    getAll() {
        this.isLoading.set(true);
        this.findAllWithParams({
            page: this.search.page,
            size: this.search.size,
        }).subscribe({
            next: (response: IResponse<IAssignment[]>) => {
                this.setAssignments(response.data, response.meta);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.alertService.displayAlert(
                    "error",
                    "Ocurrió un error al obtener las asignaciones.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
            },
        });
    }

    getAssignmentsByGroup(groupId: number) {
        this.setCurrentGroupId(groupId);
        this.isLoading.set(true);

        const params = {
            page: this.search.page,
            size: this.search.size,
        };

        this.findAllWithParamsAndCustomSource(`group/${groupId}`, params).subscribe({
            next: (response: IResponse<IAssignment[]>) => {
                this.setAssignments(response.data, response.meta);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.alertService.displayAlert(
                    "error",
                    "Ocurrió un error al obtener las asignaciones del grupo.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
            },
        });
    }

    loadCurrentGroupIfExists() {
        if (this.currentGroupId) {
            this.getAssignmentsByGroup(this.currentGroupId);
        }
    }

    saveAssignment(assignment: IAssignment, groupId?: number) {
        const targetGroup = groupId ?? this.currentGroupId;
        if (!targetGroup) {
            this.alertService.displayAlert(
                "error",
                "No se especificó el grupo para guardar la asignación.",
                "center",
                "top",
                ["error-snackbar"]
            );
            return;
        }

        const customUrl = `group/${targetGroup}`;
        this.addCustomSource(customUrl, assignment).subscribe({
            next: (response: IResponse<IAssignment>) => {
                this.alertService.displayAlert(
                    "success",
                    response.message || "Asignación creada correctamente.",
                    "center",
                    "top",
                    ["success-snackbar"]
                );
                this.getAssignmentsByGroup(targetGroup);
            },
            error: () => {
                this.alertService.displayAlert(
                    "error",
                    "Error al guardar la asignación.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
            },
        });
    }

    update(item: IAssignment, groupId?: number) {
        if (!item.id) {
            this.alertService.displayAlert(
                "error",
                "No se puede actualizar una asignación sin ID.",
                "center",
                "top",
                ["error-snackbar"]
            );
            return;
        }

        this.edit(item.id, item).subscribe({
            next: () => {
                this.alertService.displayAlert(
                    "success",
                    "Asignación actualizada correctamente.",
                    "center",
                    "top",
                    ["success-snackbar"]
                );

                const target = groupId ?? this.currentGroupId;
                if (target) {
                    this.getAssignmentsByGroup(target);
                } else {
                    this.getAll();
                }
            },
            error: () => {
                this.alertService.displayAlert(
                    "error",
                    "Ocurrió un error al actualizar la asignación.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
            },
        });
    }

    delete(item: IAssignment, groupId?: number) {
        if (!item.id) return;

        this.del(item.id).subscribe({
            next: (response: IResponse<IAssignment>) => {
                this.alertService.displayAlert(
                    "success",
                    response.message || "Asignación eliminada correctamente.",
                    "center",
                    "top",
                    ["success-snackbar"]
                );

                const target = groupId ?? this.currentGroupId;
                if (target) {
                    this.getAssignmentsByGroup(target);
                } else {
                    this.getAll();
                }
            },
            error: () => {
                this.alertService.displayAlert(
                    "error",
                    "Ocurrió un error al eliminar la asignación.",
                    "center",
                    "top",
                    ["error-snackbar"]
                );
            },
        });
    }

    private setAssignments(data: IAssignment[], meta: any) {
        this.assignmentListSignal.set(data);
        this.search = {...this.search, ...meta};
        this.totalItems = Array.from(
            {length: this.search.totalPages || 0},
            (_, i) => i + 1
        );
    }
}
