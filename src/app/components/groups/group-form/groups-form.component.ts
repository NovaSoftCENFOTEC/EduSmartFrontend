import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  effect,
} from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IGroup, ICourse } from "../../../interfaces";
import { AuthService } from "../../../services/auth.service";
import { ActivatedRoute } from "@angular/router";
import { TeacherService } from "../../../services/teacher.service";
import { CourseService } from "../../../services/course.service";

@Component({
  selector: "app-groups-form",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./groups-form.component.html",
  styleUrls: ["./groups-form.component.scss"],
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

  private teachersService = inject(TeacherService);
  private courseService = inject(CourseService);

  public teachersEffect = effect(() => {
    this.teachers = this.teachersService.teachers$();
  });

  public coursesEffect = effect(() => {
    this.courses = this.courseService.courses$();
  });

  ngOnInit(): void {
    this.authService.getUserAuthorities();

    this.route.data.subscribe((data) => {
      this.areActionsAvailable = this.authService.areActionsAvailable(
        data["authorities"] ?? []
      );
    });

    const schoolId = 1;

    this.teachersService.getTeachersBySchool(schoolId);
    this.courseService.getAll(); 
  }

  callSave() {
    if (this.form.invalid) return;

    const selectedCourse = this.form.controls["course"].value as ICourse;
    const selectedTeacher = this.form.controls["teacher"].value;

    const item: IGroup = {
      name: this.form.controls["name"].value,
      course: selectedCourse,
      teacher: selectedTeacher,
    };

    if (this.form.controls["id"].value) {
      item.id = this.form.controls["id"].value;
    }

    if (item.id) {
      this.callUpdateMethod.emit(item);
    } else {
      this.callSaveMethod.emit(item);
    }
  }
  trackById(index: number, item: ICourse): number {
    return item.id ?? index;
  }

  trackByTeacherId(index: number, item: any): number {
    return item.id ?? index;
  }
}
