import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IBadge } from '../../../interfaces';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-badge-form',
  templateUrl: './badge-form.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  styleUrls: ['./badge-form.component.scss']
})
export class BadgeFormComponent {
  @Input() form!: FormGroup;
  @Input() isEditMode = false;

  @Output() callSaveMethod = new EventEmitter<IBadge>();

  submitForm() {
    if (this.form.valid) {
      this.callSaveMethod.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  openUploadWidget() {
    const widget = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: 'dghnoosr7',
          uploadPreset: 'EduSmart',
        },
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            this.form.get('iconUrl')?.setValue(result.info.secure_url);
          }
        }
    );
    widget.open();
  }
}
