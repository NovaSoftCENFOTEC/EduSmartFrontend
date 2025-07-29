import { Component, inject, OnInit, ViewChild, WritableSignal, signal } from '@angular/core';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { IUser, IGroup, ISearch } from '../../interfaces';
import { FormBuilder, Validators } from '@angular/forms';
import { StudentService } from '../../services/groupstudent.service';
import { GroupsService } from '../../services/groups.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { StudentsFormComponent } from '../../components/groupstudents/student-form/students-form.component';
import { StudentsListComponent } from '../../components/groupstudents/student-list/students-list.component';
import { NgIf } from '@angular/common';
import { UserService } from '../../services/user.service';
import { FooterComponent } from "../../components/app-layout/elements/footer/footer.component";

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
export class GroupStudentsComponent implements OnInit {
    public studentList!: WritableSignal<IUser[]>;
    private studentListSignal = signal<IUser[]>([]);

    public studentService: StudentService = inject(StudentService);
    public groupsService: GroupsService = inject(GroupsService);
    public userService: UserService = inject(UserService);
    public fb: FormBuilder = inject(FormBuilder);
    public modalService: ModalService = inject(ModalService);
    public authService: AuthService = inject(AuthService);
    public route: ActivatedRoute = inject(ActivatedRoute);
    public schoolName: string | null = null;

    @ViewChild('editStudentModal') public editStudentModal: any;
    @ViewChild('addStudentModal') public addStudentModal: any;
    @ViewChild('editConfirmationModal') public editConfirmationModal: any;

    public areActionsAvailable: boolean = false;
    private originalStudent: IUser | null = null;
    private pendingEditItem: IUser | null = null;
    private groupId: number | null = null;
    private currentGroup: IGroup | null = null;
    
    public search: ISearch = {
        page: 1,
        size: 5,
        pageNumber: 1,
        totalPages: 1
    };

    studentForm = this.fb.group({
        id: [''],
        name: [''],
        lastname: [''],
        email: [''],
        student: ['', Validators.required],
        createdAt: ['']
    });

    constructor() {
        this.studentList = this.studentListSignal;
    }

    ngOnInit(): void {
        this.authService.getUserAuthorities();
        this.route.queryParams.subscribe(params => {
            const groupId = Number(params['groupId']);
            if (groupId && !isNaN(groupId)) {
                this.groupId = groupId;
                this.loadGroupAndStudents(groupId);
            }
        });

        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
            this.schoolName = this.authService.getUser()?.school?.name || null;
        });
    }

    loadGroupAndStudents(groupId: number): void {
        this.groupsService.getById(groupId).subscribe({
            next: (response) => {
                if (!response || !response.data) {
                    this.currentGroup = null;
                    this.studentListSignal.set([]);
                    return;
                }

                this.currentGroup = response.data;
                const allStudents = this.currentGroup?.students ?? [];

                const page = this.search.page ?? 1;
                const size = this.search.size ?? 5;

                this.search.totalPages = Math.ceil(allStudents.length / size);
                this.search.pageNumber = page;

                const startIndex = (page - 1) * size;
                const endIndex = startIndex + size;

                this.studentListSignal.set(allStudents.slice(startIndex, endIndex));
            },
            error: () => {
                this.currentGroup = null;
                this.studentListSignal.set([]);
            }
        });
    }

    loadStudents(): void {
        if (this.groupId) {
            this.loadGroupAndStudents(this.groupId);
        }
    }

    handleAddStudent(item: IUser) {
        if (this.groupId) {
            this.studentService.saveStudent(this.groupId, item);
        }
        this.modalService.closeAll();
        this.studentForm.reset();
        setTimeout(() => {
            if (this.groupId) {
                this.loadGroupAndStudents(this.groupId);
            }
        }, 1000);
    }

    updateStudent() {
        if (!this.originalStudent) return;
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
       
   
    if (!item.id || !this.groupId) {
        return;
    }
    
   
    this.groupsService.deleteStudentFromGroup(this.groupId, item.id);
    
    
    setTimeout(() => {
        this.loadGroupAndStudents(this.groupId!);
    }, 1000);

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
        this.studentForm.patchValue({ student: '' });
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
