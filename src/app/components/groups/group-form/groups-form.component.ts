import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IGroup, ICourse, IUser } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-groups-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './groups-form.component.html',
  styleUrl: './groups-form.component.scss'
})
export class GroupsFormComponent {
  public fb: FormBuilder = inject(FormBuilder);
  @Input() form!: FormGroup;
  @Output() callSaveMethod: EventEmitter<IGroup> = new EventEmitter<IGroup>();
  @Output() callUpdateMethod: EventEmitter<IGroup> = new EventEmitter<IGroup>();

  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);

  public courses: ICourse[] = []; 
  public teachers: any[] = [];
  private teachersService: TeacherService = inject(TeacherService);


  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe(data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
    });

    
    const currentUser = this.authService.getUser();
    const userSchoolId = currentUser?.school?.id; 
    if (userSchoolId && typeof userSchoolId === 'number') {
      this.teachersService.getTeachersBySchool(userSchoolId);
      this.teachers = this.teachersService.teachers$();
    } else {
     
      this.teachers = [];
    }

    this.courses = [
      { id: 1, title: 'Matemáticas' },
      { id: 2, title: 'Historia' },
      { id: 3, title: 'Epoca Precolombina' }
      // ...otros cursos
    ];
  }

  callSave() {
    if (this.form.invalid) return;

    let item: IGroup = {
      name: this.form.controls["name"].value,
      course: this.form.controls["course"].value,
      teacher: this.form.controls["teacher"].value 
    };

    if (this.form.controls['id'].value) {
      item.id = this.form.controls['id'].value;
    }

    if (item.id) {
      this.callUpdateMethod.emit(item);
    } else {
      this.callSaveMethod.emit(item);
    }
  }

  // Agregar las funciones de comparación para los selects
  compareCourses(c1: ICourse, c2: ICourse): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareTeachers(t1: any, t2: any): boolean {
    return t1 && t2 ? t1.id === t2.id : t1 === t2;
  }
}
