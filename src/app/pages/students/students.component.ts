import { Component, inject, OnInit, ViewChild, WritableSignal } from '@angular/core';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { IUser } from '../../interfaces';
import { FormBuilder, Validators } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { StudentsFormComponent } from '../../components/students/students-form/students-form.component';
import { StudentsListComponent } from '../../components/students/students-list/students-list.component';
import {UserService} from "../../services/user.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    PaginationComponent,
    ModalComponent,
    StudentsFormComponent,
    StudentsListComponent,
  ],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
  public studentList!: WritableSignal<IUser[]>;
  public schoolId: number | null = null;
  public schoolName: string | null = null;
  public areActionsAvailable: boolean = false;

  public studentService = inject(StudentService);
  public userService = inject(UserService);
  public fb = inject(FormBuilder);
  public modalService = inject(ModalService);
  public authService = inject(AuthService);
  public route = inject(ActivatedRoute);

  @ViewChild('editStudentModal') public editStudentModal!: any;
  @ViewChild('addStudentModal') public addStudentModal!: any;
  @ViewChild('editConfirmationModal') public editConfirmationModal!: any;

  studentForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    createdAt: ['']
  });

  private originalStudent: IUser | null = null;
  private pendingEditItem: IUser | null = null;

  constructor() {
    this.studentList = this.studentService.students$;
  }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();

    if (currentUser && currentUser.school && currentUser.school.id) {
      this.schoolId = currentUser.school.id;
      this.schoolName = currentUser.school.name || 'Desconocida';
      sessionStorage.setItem('schoolId', this.schoolId.toString());
      sessionStorage.setItem('schoolName', this.schoolName);
    } else {
      this.route.queryParams.subscribe(params => {
        const routeSchoolId = Number(params['schoolId']);
        const sessionSchoolId = Number(sessionStorage.getItem('schoolId'));
        const sessionSchoolName = sessionStorage.getItem('schoolName');

        if (!isNaN(routeSchoolId) && routeSchoolId > 0) {
          this.schoolId = routeSchoolId;
        } else if (!isNaN(sessionSchoolId) && sessionSchoolId > 0) {
          this.schoolId = sessionSchoolId;
          this.schoolName = sessionSchoolName || 'Desconocida';
        } else {
          this.schoolId = null;
          this.schoolName = null;
        }

        sessionStorage.setItem('schoolId', this.schoolId?.toString() ?? '');
        sessionStorage.setItem('schoolName', this.schoolName ?? '');
        this.loadStudents();
      });
    }

    if (this.schoolId !== null) {
      this.loadStudents();
    }

    this.route.data.subscribe(data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
    });
  }

  loadStudents(): void {
    if (this.schoolId) {
      this.studentService.getStudentsBySchool(this.schoolId);
    }
  }

  handleAddStudent(item: IUser) {
    if (!this.schoolId) return;
    this.studentService.saveStudent(this.schoolId, item);
    this.modalService.closeAll();
    this.studentForm.reset();
  }

  updateStudent() {
    if (!this.originalStudent) return;

    const payloadToSend: Partial<IUser> = {
      id: this.originalStudent.id,
      name: this.studentForm.controls['name'].value || '',
      lastname: this.studentForm.controls['lastname'].value || ''
    };

    this.userService.update(payloadToSend as IUser, () => {
      this.modalService.closeAll();
      this.studentForm.reset();
      this.originalStudent = null;
      this.studentService.getStudentsBySchool(this.schoolId!);
    });
  }

  deleteStudent(item: IUser) {
    this.userService.delete(item, () => {
      this.studentService.getStudentsBySchool(this.schoolId!);
    });
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
    this.studentForm.controls['email'].disable();
    this.modalService.displayModal('lg', this.editStudentModal);
  }

  openAddStudentModal() {
    this.studentForm.reset();
    this.studentForm.controls['email'].enable();
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