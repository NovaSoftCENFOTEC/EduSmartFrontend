import {Component, inject, OnInit, ViewChild, WritableSignal} from '@angular/core';
import {PaginationComponent} from '../../components/pagination/pagination.component';
import {ModalComponent} from '../../components/modal/modal.component';
import {IUser} from '../../interfaces';
import {FormBuilder, Validators} from '@angular/forms';
import {TeacherService} from '../../services/teacher.service';
import {ModalService} from '../../services/modal.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute} from '@angular/router';
import {TeachersFormComponent} from '../../components/teachers/teacher-form/teachers-form.component';
import {TeachersListComponent} from '../../components/teachers/teacher-list/teachers-list.component';
import {NgIf} from '@angular/common';
import {UserService} from '../../services/user.service';

@Component({
    selector: 'app-teachers',
    standalone: true,
    imports: [
        PaginationComponent,
        ModalComponent,
        TeachersFormComponent,
        TeachersListComponent,
        NgIf
    ],
    templateUrl: './teachers.component.html',
    styleUrls: ['./teachers.component.scss']
})
export class TeachersComponent implements OnInit {
    public teacherList!: WritableSignal<IUser[]>;

    public teacherService: TeacherService = inject(TeacherService);
    public userService: UserService = inject(UserService);
    public fb: FormBuilder = inject(FormBuilder);
    public modalService: ModalService = inject(ModalService);
    public authService: AuthService = inject(AuthService);
    public route: ActivatedRoute = inject(ActivatedRoute);

    @ViewChild('editTeacherModal') public editTeacherModal: any;
    @ViewChild('addTeacherModal') public addTeacherModal: any;
    @ViewChild('editConfirmationModal') public editConfirmationModal: any;

    public areActionsAvailable: boolean = false;
    private schoolId: number | null = null;
    private originalTeacher: IUser | null = null;
    private pendingEditItem: IUser | null = null;

    teacherForm = this.fb.group({
        id: [''],
        name: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        createdAt: ['']
    });

    constructor() {
        this.teacherList = this.userService.users$;
    }

    ngOnInit(): void {
        //Se inicializa el servicio de profesores y se obtiene la lista de profesores
        //Ya que se usa el servicio de usuarios para obtener la lista de profesores
        this.authService.getUserAuthorities();
        this.route.queryParams.subscribe(params => {
            const id = Number(params['schoolId']);

            if (id) {
                this.schoolId = id;
                sessionStorage.setItem('schoolId', id.toString());
                this.teacherList = this.teacherService.teachers$;
                this.loadTeachers();
            } else {
                const storedId = sessionStorage.getItem('schoolId');
                if (storedId) {
                    this.schoolId = Number(storedId);
                    this.teacherList = this.teacherService.teachers$;
                    this.loadTeachers();
                } else {
                    this.schoolId = null;
                    this.teacherList = this.userService.users$;
                    this.loadTeachers();
                }
            }
        });

        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
        });
    }

    loadTeachers(): void {
        if (this.schoolId) {
            this.teacherService.getTeachersBySchool(this.schoolId);
        } else {
            this.userService.getAll();
        }
    }

    handleAddTeacher(item: IUser) {
        if (!this.schoolId) return;
        this.teacherService.saveTeacher(this.schoolId, item);
        this.modalService.closeAll();
        this.teacherForm.reset();
    }

    updateTeacher() {
        if (!this.schoolId || !this.originalTeacher) return;
        const updatedTeacher: IUser = {
            ...this.originalTeacher,
            name: this.teacherForm.controls['name'].value || '',
            lastname: this.teacherForm.controls['lastname'].value || '',
            email: this.teacherForm.controls['email'].value || ''
        };
        this.userService.update(updatedTeacher);
        this.modalService.closeAll();
        this.teacherForm.reset();
        this.originalTeacher = null;
    }

    deleteTeacher(item: IUser) {
        if (!this.schoolId || !item.id) return;
        this.userService.delete(item);
    }

    openEditTeacherModal(teacher: IUser) {
        this.originalTeacher = teacher;
        this.teacherForm.patchValue({
            id: JSON.stringify(teacher.id),
            name: teacher.name,
            lastname: teacher.lastname,
            email: teacher.email,
            createdAt: teacher.createdAt
        });
        this.modalService.displayModal('lg', this.editTeacherModal);
    }

    openAddTeacherModal() {
        this.teacherForm.reset();
        this.modalService.displayModal('md', this.addTeacherModal);
    }

    confirmEdit(item: IUser) {
        this.pendingEditItem = item;
        this.modalService.closeAll();
        this.modalService.displayModal('sm', this.editConfirmationModal);
    }

    cancelEdit() {
        this.pendingEditItem = null;
        this.modalService.closeAll();
        this.modalService.displayModal('lg', this.editTeacherModal);
    }

    confirmEditFinal() {
        if (this.pendingEditItem) {
            this.updateTeacher();
            this.pendingEditItem = null;
        }
    }

    goBack() {
        window.history.back();
    }

}
