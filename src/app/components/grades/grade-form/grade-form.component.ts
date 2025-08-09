import { Component, EventEmitter, Input, Output, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { IGrade } from "../../../interfaces";


@Component({
  selector: "app-grade-form",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./grade-form.component.html",
  styleUrls: ["./grade-form.component.scss"], 
})
export class GradesFormComponent implements OnInit {
  public fb: FormBuilder = inject(FormBuilder);

  @Input() form!: FormGroup;
  @Output() callSaveMethod: EventEmitter<IGrade> = new EventEmitter<IGrade>();
  @Output() callUpdateMethod: EventEmitter<IGrade> = new EventEmitter<IGrade>();

  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe((data) => {
      this.areActionsAvailable = this.authService.areActionsAvailable(
        data["authorities"] ?? []
      );
    });

    if (!this.form) {
      this.form = this.fb.group({
        id: [null],
        grade: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
        justification: ["", Validators.required],
        submissionId: [null, Validators.required],
        teacherId: [null, Validators.required],
      });
    }
  }

  callSave() {
    if (this.form.invalid) return;

    const item: IGrade = {
      grade: this.form.controls["grade"].value,
      justification: this.form.controls["justification"].value,
      submissionId: this.form.controls["submissionId"].value,
      teacherId: this.form.controls["teacherId"].value,
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
export { IGrade };

