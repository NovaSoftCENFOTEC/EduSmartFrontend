import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {IUser} from "../../interfaces";
import {AlertService} from "../../services/alert.service";

@Component({
    selector: "app-change-password",
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: "./change-password.component.html",
    styleUrl: "./change-password.component.scss",
})
export class ChangePasswordComponent {
    public fb: FormBuilder = inject(FormBuilder);
    @Input() form!: FormGroup;
    @Output() callChangePasswordMethod: EventEmitter<IUser> =
        new EventEmitter<IUser>();
    private alertService = inject(AlertService);

    callSave() {
        if (this.form.invalid) return;

        if (
            this.form.controls["password"].value !==
            this.form.controls["confirmPassword"].value
        ) {
            this.alertService.displayAlert(
                "error",
                "Las contraseñas no coinciden",
                "center",
                "top",
                ["error-snackbar"]
            );
            return;
        }

        let item: IUser = {
            id: this.form.controls["id"].value,
            password: this.form.controls["password"].value,
        };

        if (item.id) {
            this.callChangePasswordMethod.emit(item);
        }
    }
}
