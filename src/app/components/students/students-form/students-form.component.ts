import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-students-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './students-form.component.html',
  styleUrls: ['./students-form.component.scss']
})
export class StudentsFormComponent {
  public fb: FormBuilder = inject(FormBuilder);
  @Input() form!: FormGroup;
  @Output() callSaveMethod: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() callUpdateMethod: EventEmitter<IUser> = new EventEmitter<IUser>();

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

    let item: IUser = {
      name: this.form.controls['name'].value,
      lastname: this.form.controls['lastname'].value,
      email: this.form.controls['email'].value,
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
