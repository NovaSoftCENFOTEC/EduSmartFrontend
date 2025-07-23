import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { IAssignment } from "../../../interfaces";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-assignments-form",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./assignments-form.component.html",
  styleUrl: "./assignments-form.component.scss",
})
export class AssignmentsFormComponent {
  public fb: FormBuilder = inject(FormBuilder);
  @Input() form!: FormGroup;
  @Output() callSaveMethod: EventEmitter<IAssignment> =
    new EventEmitter<IAssignment>();
  @Output() callUpdateMethod: EventEmitter<IAssignment> =
    new EventEmitter<IAssignment>();

  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);

  public minDueDate: string;

  constructor() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    this.minDueDate = `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe((data) => {
      this.areActionsAvailable = this.authService.areActionsAvailable(
        data["authorities"] ?? []
      );
    });
  }

  callSave() {
    if (this.form.invalid) return;

    const item: IAssignment = {
      title: this.form.controls["title"].value,
      description: this.form.controls["description"].value,
      type: this.form.controls["type"].value,
      dueDate: this.form.controls["due_date"].value,
      group: {
        id: 0,
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
