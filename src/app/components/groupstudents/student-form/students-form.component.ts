import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service'; 
import { NgForOf, NgIf } from '@angular/common';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-students-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgIf, NgForOf],
  templateUrl: './students-form.component.html',
  styleUrls: ['./students-form.component.scss']
})
export class StudentsFormComponent implements OnInit {
  public fb: FormBuilder = inject(FormBuilder);
  @Input() form!: FormGroup;
  @Input() availableStudents = signal<IUser[]>([]); 
  
  @Output() callSaveMethod: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() callUpdateMethod: EventEmitter<IUser> = new EventEmitter<IUser>();

  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);

  private studentService = inject(StudentService);

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe(data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
    });
    
    this.loadAvailableStudents();
  }

  
 loadAvailableStudents(): void {
    const currentUser = this.authService.getUser();
    const userSchoolId = currentUser?.school?.id;
    
 
    
    if (userSchoolId) {
   
     
        this.studentService.getStudentsBySchool(userSchoolId);
        
        setTimeout(() => {
            const schoolStudents = this.studentService.students$();
   
            this.availableStudents.set(schoolStudents);
        }, 500);
    } else {
        console.warn('⚠️ No se encontró school ID del usuario');
        this.availableStudents.set([]);
    }
}

  callSave() {

    const selectedStudentId = this.form.controls["student"].value;
    const selectedStudent = this.availableStudents().find(student => student.id == selectedStudentId);
    
    if (!selectedStudent) {
   
      return;
    }

  

    if (this.form.controls['id'].value) {
      selectedStudent.id = this.form.controls['id'].value;
      this.callUpdateMethod.emit(selectedStudent);
    } else {
      this.callSaveMethod.emit(selectedStudent);
    }
  }
}
