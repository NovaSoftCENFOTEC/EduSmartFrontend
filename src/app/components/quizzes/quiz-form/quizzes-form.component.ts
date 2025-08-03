import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { IQuiz, IOption } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'app-quizzes-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    LoaderComponent
  ],
  templateUrl: './quizzes-form.component.html',
  styleUrl: './quizzes-form.component.scss'
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
 //Aqui agregue
  public userAnswers: { [questionId: number]: number } = {}; // questionId -> optionId
  public questions: { id: number; options: IOption[] }[] = []; // Aqui agregue
//Aqui agregue
  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe(data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
    });
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  get isEditMode(): boolean {
    return this.form?.controls['id']?.value ? true : false;
  }

  get formTitle(): string {
    return this.isEditMode ? 'Editar Quiz' : 'Crear Quiz';
  }

  get buttonText(): string {
    return this.isEditMode ? 'Actualizar' : 'Guardar';
  }

  callSave() {
    if (this.form.invalid || this.isLoading) return;

    const item: IQuiz = {
      title: this.form.controls['title'].value,
      description: this.form.controls['description'].value,
      dueDate: this.form.controls['dueDate'].value,
      numberOfQuestions: this.form.controls['numberOfQuestions'].value,
      generateWithAI: true,
      story: {
        id: this.form.controls['storyId'].value || 0
      }
    };

    if (this.form.controls['id']?.value) {
      item.id = this.form.controls['id'].value;
    }

    if (item.id) {
      this.callUpdateMethod.emit(item);
    } else {
      this.callSaveMethod.emit(item);
    }
  }
  //Aqui agregue
  getScore(): number {
    let correctCount = 0;
    let totalQuestions = this.questions.length;

    for (const question of this.questions) {
        const userOptionId = this.userAnswers[question.id];
        const correctOption = question.options?.find(opt => opt.correct);

        if (correctOption && userOptionId === correctOption.id) {
            correctCount++;
        }
    }

    return totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
}
//Aqui agregue
}

