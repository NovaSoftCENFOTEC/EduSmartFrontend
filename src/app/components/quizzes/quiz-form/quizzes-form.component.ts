import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { IQuiz } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-quizzes-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './quizzes-form.component.html',
  styleUrl: './quizzes-form.component.scss'
})
export class QuizzesFormComponent implements OnInit {
  public fb: FormBuilder = inject(FormBuilder);
  @Input() form!: FormGroup;
  @Output() callSaveMethod: EventEmitter<IQuiz> = new EventEmitter<IQuiz>();
  @Output() callUpdateMethod: EventEmitter<IQuiz> = new EventEmitter<IQuiz>();

  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe(data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
    });
  }

  callSave() {
    if (this.form.invalid) return;

    const item: IQuiz = {
      title: this.form.controls['title'].value,
      description: this.form.controls['description'].value,
      dueDate: this.form.controls['due_date'].value,
      numberOfQuestions: this.form.controls['number_of_questions'].value,
      generateWithAI: this.form.controls['generate_with_ai'].value,
      story: {
        id: 0
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
}

