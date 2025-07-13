import {Component, inject, OnInit, ViewChild, WritableSignal, signal} from '@angular/core';
import {PaginationComponent} from '../../components/pagination/pagination.component';
import {ModalComponent} from '../../components/modal/modal.component';
import {IUser, IGroup} from '../../interfaces';
import {FormBuilder, Validators} from '@angular/forms';
import {StudentService} from '../../services/groupstudent.service'; 
import {GroupsService} from '../../services/groups.service';
import {ModalService} from '../../services/modal.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute} from '@angular/router';
import {StudentsFormComponent} from '../../components/groupstudents/student-form/students-form.component';
import {StudentsListComponent} from '../../components/groupstudents/student-list/students-list.component'; 
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
    private studentListSignal = signal<IUser[]>([]);

    public studentService: StudentService = inject(StudentService); 
    public groupsService: GroupsService = inject(GroupsService);
    public userService: UserService = inject(UserService);
    public fb: FormBuilder = inject(FormBuilder);
    public modalService: ModalService = inject(ModalService);
    public authService: AuthService = inject(AuthService);
    public route: ActivatedRoute = inject(ActivatedRoute);

    @ViewChild('editStudentModal') public editStudentModal: any; 
    @ViewChild('addStudentModal') public addStudentModal: any; 
    @ViewChild('editConfirmationModal') public editConfirmationModal: any;

    public areActionsAvailable: boolean = false;
    private originalStudent: IUser | null = null; 
    private pendingEditItem: IUser | null = null;
    private groupId: number | null = null; 
    private currentGroup: IGroup | null = null;

    studentForm = this.fb.group({ 
        id: [''],
        name: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        createdAt: ['']
    });

    constructor() {
        this.studentList = this.studentListSignal;
    }

    ngOnInit(): void {
        this.authService.getUserAuthorities();
        this.route.queryParams.subscribe(params => {
            const groupId = Number(params['groupId']);
     
            console.log('🔍 Params recibidos - groupId:', groupId);
            if (groupId && !isNaN(groupId)) {
                this.groupId = groupId;
                this.loadGroupAndStudents(groupId);
            } 
        });

        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
        });
    }

    // ✅ CORREGIDO: Método mejorado con tipos correctos
    loadGroupAndStudents(groupId: number): void {
        console.log('🔍 Cargando todos los grupos para filtrar por ID:', groupId);
        
        this.groupsService.getAll();
        
        // ✅ CORREGIDO: groups$() es un signal, no un observable
        const groups: IGroup[] = this.groupsService.groups$();
        console.log('📋 Todos los grupos recibidos:', groups);
        
        // ✅ CORREGIDO: Tipos explícitos para evitar 'any'
        const foundGroup: IGroup | undefined = groups.find((group: IGroup) => group.id === groupId);
        
        if (foundGroup) {
            this.currentGroup = foundGroup;
            console.log('🎯 Grupo encontrado:', this.currentGroup);
            
            // ✅ CORREGIDO: Verificar que currentGroup no es null
            if (this.currentGroup) {
                console.log('📊 Información del grupo:');
                console.log('  - ID:', this.currentGroup.id);
                console.log('  - Nombre:', this.currentGroup.name);
                console.log('  - Curso:', this.currentGroup.course);
                console.log('  - Profesor:', this.currentGroup.teacher);
                console.log('  - Estudiantes:', this.currentGroup.students);
                
                this.studentListSignal.set(this.currentGroup.students || []);
            }
        } else {
            console.log('❌ Grupo no encontrado con ID:', groupId);
            this.studentListSignal.set([]);
        }
    }

    // ✅ AGREGADO: Método que faltaba para pagination
    loadStudents(): void {
        if (this.groupId) {
            this.loadGroupAndStudents(this.groupId);
        }
    }

    handleAddStudent(item: IUser) { 
        console.log('🎯 handleAddStudent ejecutado:', item);
        console.log('📋 Grupo actual completo:', this.currentGroup);

        if (this.groupId) {
            this.studentService.saveStudent(this.groupId, item);
        }
        
        this.modalService.closeAll();
        this.studentForm.reset(); 
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
        if (!item.id) return;
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
