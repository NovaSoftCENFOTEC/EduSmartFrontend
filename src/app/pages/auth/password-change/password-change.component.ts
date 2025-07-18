import { CommonModule } from "@angular/common";
import { Component, inject, ViewChild } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { UserService } from "../../../services/user.service";
import { FooterComponent } from "../../../components/app-layout/elements/footer/footer.component";
import { TopbarComponent } from "../../../components/app-layout/elements/topbar/topbar.component";
import { AlertService } from "../../../services/alert.service";

@Component({
  selector: "app-password-change",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TopbarComponent,
    FooterComponent,
  ],
  templateUrl: "./password-change.component.html",
  styleUrl: "./password-change.component.scss",
})
export class PasswordChangeComponent {
  private alertService = inject(AlertService);
  public passChangeError!: string;
  @ViewChild("password") passwordModel!: NgModel;
  @ViewChild("confirmPassword") confirmPasswordModel!: NgModel;

  public userId: any = history.state.userId;

  public recoveryForm: { password: string; confirmPassword: string } = {
    password: "",
    confirmPassword: "",
  };

  public showPassword = false;

  constructor(private router: Router, private userService: UserService) {}

  public handlePasswordChange(event: Event) {
    event.preventDefault();
    if (!this.passwordModel.valid) {
      this.passwordModel.control.markAsTouched();
    }
    if (!this.confirmPasswordModel.valid) {
      this.confirmPasswordModel.control.markAsTouched();
    }
    if (this.passwordModel.valid && this.confirmPasswordModel.valid) {
      if (this.recoveryForm.password !== this.recoveryForm.confirmPassword) {
        this.alertService.displayAlert(
          "error",
          "Las contraseñas no coinciden",
          "center",
          "top",
          ["error-snackbar"]
        );
        return;
      } else {
        this.userService
          .changePassword(this.userId, this.recoveryForm.password)
          .add(() => {
            this.router
              .navigateByUrl("/", { skipLocationChange: true })
              .then(() => {
                this.router.navigate(["/app/dashboard"]);
              });
          });
      }
    }
  }
}
