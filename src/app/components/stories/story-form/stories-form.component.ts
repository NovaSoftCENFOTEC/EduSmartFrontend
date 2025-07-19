import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IStory } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-stories-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './stories-form.component.html',
  styleUrls: ['./stories-form.component.scss']
})
export class StoriesFormComponent {
  public fb: FormBuilder = inject(FormBuilder);
  @Input() form!: FormGroup;
  @Output() callSaveMethod: EventEmitter<IStory> = new EventEmitter<IStory>();
  @Output() callUpdateMethod: EventEmitter<IStory> = new EventEmitter<IStory>();

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

    const item: IStory = {
      title: this.form.controls['title'].value,
      content: this.form.controls['content'].value,
      createdAt: this.form.controls['createdAt'].value || new Date().toISOString()
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
}