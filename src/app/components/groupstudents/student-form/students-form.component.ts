import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service'; 
import { NgForOf, NgIf } from '@angular/common';

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
  private userService: UserService = inject(UserService); 

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe(data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
    });
    
    this.loadAvailableStudents();
  }

  
  loadAvailableStudents(): void {
    this.userService.getAll();
    setTimeout(() => {
        const allUsers = this.userService.users$();
       
        this.availableStudents.set(allUsers);
    
    }, 300); 
  }

  callSave() {

    const selectedStudentId = this.form.controls["student"].value;
    const selectedStudent = this.availableStudents().find(student => student.id == selectedStudentId);
    
    if (!selectedStudent) {
      console.log('❌ Estudiante no encontrado');
      return;
    }

    console.log('📦 Estudiante completo a enviar:', selectedStudent);

    if (this.form.controls['id'].value) {
      selectedStudent.id = this.form.controls['id'].value;
      this.callUpdateMethod.emit(selectedStudent);
    } else {
      this.callSaveMethod.emit(selectedStudent);
    }
  }
}
