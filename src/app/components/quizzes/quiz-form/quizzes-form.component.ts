import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";

import { IQuiz } from "../../../interfaces";
import { AuthService } from "../../../services/auth.service";
import { LoaderComponent } from "../../loader/loader.component";

@Component({
  selector: "app-quizzes-form",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoaderComponent],
  templateUrl: "./quizzes-form.component.html",
  styleUrl: "./quizzes-form.component.scss",
})
export class QuizzesFormComponent implements OnInit {
  public fb: FormBuilder = inject(FormBuilder);
  @Input() form!: FormGroup;
  @Input() isLoading: boolean = false;
  @Output() callSaveMethod: EventEmitter<IQuiz> = new EventEmitter<IQuiz>();
  @Output() callUpdateMethod: EventEmitter<IQuiz> = new EventEmitter<IQuiz>();

  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);

  get isEditMode(): boolean {
    return this.form?.controls["id"]?.value ? true : false;
  }

  get formTitle(): string {
    return this.isEditMode ? "Editar Quiz" : "Crear Quiz";
  }

  get buttonText(): string {
    return this.isEditMode ? "Actualizar" : "Guardar";
  }

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe((data) => {
      this.areActionsAvailable = this.authService.areActionsAvailable(
        data["authorities"] ?? []
      );
    });
  }

  getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
  }

  callSave() {
    if (this.form.invalid || this.isLoading) return;

    const item: IQuiz = {
      title: this.form.controls["title"].value,
      description: this.form.controls["description"].value,
      dueDate: this.form.controls["dueDate"].value,
      numberOfQuestions: this.form.controls["numberOfQuestions"].value,
      generateWithAI: true,
      story: {
        id: this.form.controls["storyId"].value || 0,
      },
    };

    if (this.form.controls["id"]?.value) {
      item.id = this.form.controls["id"].value;
    }

    if (item.id) {
      this.callUpdateMethod.emit(item);
    } else {
      this.callSaveMethod.emit(item);
    }
  }
}
