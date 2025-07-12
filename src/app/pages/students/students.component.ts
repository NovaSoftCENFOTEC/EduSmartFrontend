import {Component, inject, OnInit, ViewChild, WritableSignal} from '@angular/core';
import {PaginationComponent} from '../../components/pagination/pagination.component';
import {ModalComponent} from '../../components/modal/modal.component';
import {IUser} from '../../interfaces';
import {FormBuilder, Validators} from '@angular/forms';
import {StudentService} from '../../services/student.service';
import {ModalService} from '../../services/modal.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute} from '@angular/router';
import {StudentsFormComponent} from '../../components/students/student-form/students-form.component';
import {StudentsListComponent} from '../../components/students/student-list/students-list.component';
import {NgIf} from '@angular/common';
import {UserService} from '../../services/user.service';
import {FooterComponent} from "../../components/app-layout/elements/footer/footer.component";

@Component({
    selector: 'app-students',
    standalone: true,
    imports: [
        PaginationComponent,
        ModalComponent,
        StudentsFormComponent,
        StudentsListComponent,
        NgIf,
        FooterComponent
    ],
    templateUrl: './students.component.html',
    styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
    public studentList!: WritableSignal<IUser[]>;

    public studentService: StudentService = inject(StudentService);
    public userService: UserService = inject(UserService);
    public fb: FormBuilder = inject(FormBuilder);
    public modalService: ModalService = inject(ModalService);
    public authService: AuthService = inject(AuthService);
    public route: ActivatedRoute = inject(ActivatedRoute);

    @ViewChild('editStudentModal') public editStudentModal: any;
    @ViewChild('addStudentModal') public addStudentModal: any;
    @ViewChild('editConfirmationModal') public editConfirmationModal: any;

    public areActionsAvailable: boolean = false;
    private schoolId: number | null = null;
    private originalStudent: IUser | null = null;
    private pendingEditItem: IUser | null = null;

    studentForm = this.fb.group({
        id: [''],
        name: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        createdAt: ['']
    });

    constructor() {
        this.studentList = this.userService.users$;
    }

    ngOnInit(): void {
        this.authService.getUserAuthorities();
        this.route.queryParams.subscribe(params => {
            const id = Number(params['schoolId']);

            if (id) {
                this.schoolId = id;
                sessionStorage.setItem('schoolId', id.toString());
                this.studentList = this.studentService.students$;
                this.loadStudents();
            } else {
                const storedId = sessionStorage.getItem('schoolId');
                if (storedId) {
                    this.schoolId = Number(storedId);
                    this.studentList = this.studentService.students$;
                    this.loadStudents();
                } else {
                    this.schoolId = null;
                    this.studentList = this.userService.users$;
                    this.loadStudents();
                }
            }
        });

        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
        });
    }

    loadStudents(): void {
        if (this.schoolId) {
            this.studentService.getStudentsBySchool(this.schoolId);
        } else {
            this.userService.getAll();
        }
    }

    handleAddStudent(item: IUser) {
        if (!this.schoolId) return;
        this.studentService.saveStudent(this.schoolId, item);
        this.modalService.closeAll();
        this.studentForm.reset();
    }

    updateStudent() {
        if (!this.schoolId || !this.originalStudent) return;
        const updatedStudent: IUser = {
            ...this.originalStudent,
            name: this.studentForm.controls['name'].value || '',
            lastname: this.studentForm.controls['lastname'].value || '',
            email: this.studentForm.controls['email'].value || ''
        };
        this.userService.update(updatedStudent);
        this.modalService.closeAll();
        this.studentForm.reset();
        this.originalStudent = null;
    }

    deleteStudent(item: IUser) {
        if (!this.schoolId || !item.id) return;
        this.userService.delete(item);
    }

    openEditStudentModal(student: IUser) {
        this.originalStudent = student;
        this.studentForm.patchValue({
            id: JSON.stringify(student.id),
            name: student.name,
            lastname: student.lastname,
            email: student.email,
            createdAt: student.createdAt
        });
        this.modalService.displayModal('lg', this.editStudentModal);
    }

    openAddStudentModal() {
        this.studentForm.reset();
        this.modalService.displayModal('md', this.addStudentModal);
    }

    confirmEdit(item: IUser) {
        this.pendingEditItem = item;
        this.modalService.closeAll();
        this.modalService.displayModal('sm', this.editConfirmationModal);
    }

    cancelEdit() {
        this.pendingEditItem = null;
        this.modalService.closeAll();
        this.modalService.displayModal('lg', this.editStudentModal);
    }

    confirmEditFinal() {
        if (this.pendingEditItem) {
            this.updateStudent();
            this.pendingEditItem = null;
        }
    }

    goBack() {
        window.history.back();
    }

}
