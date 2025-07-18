import { CommonModule } from "@angular/common";
import { Component, inject, ViewChild } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { FooterComponent } from "../../../components/app-layout/elements/footer/footer.component";
import { TopbarComponent } from "../../../components/app-layout/elements/topbar/topbar.component";
import { ILoginResponse } from "../../../interfaces";
import { AlertService } from "../../../services/alert.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TopbarComponent,
    FooterComponent,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  private alertService = inject(AlertService);
  public loginError!: string;
  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;

  public loginForm: { email: string; password: string } = {
    email: "",
    password: "",
  };

  public showPassword = false;

  constructor(private router: Router, private authService: AuthService) {}

  public handleLogin(event: Event) {
    event.preventDefault();
    if (!this.emailModel.valid) {
      this.emailModel.control.markAsTouched();
    }
    if (!this.passwordModel.valid) {
      this.passwordModel.control.markAsTouched();
    }
    if (this.emailModel.valid && this.passwordModel.valid) {
      this.authService.login(this.loginForm).subscribe({
        next: (loggedUser: ILoginResponse) => {
          if (loggedUser && loggedUser.authUser.needsPasswordChange) {
            this.router.navigateByUrl("/password-change", {
              state: { userId: loggedUser.authUser.id },
            });
          } else {
            this.router.navigateByUrl("/app/dashboard");
          }
        },
        error: (err: any) =>
          this.alertService.displayAlert(
            "error",
            "Usuario o contraseña incorrectos",
            "center",
            "top",
            ["error-snackbar"]
          ),
      });
    }
  }
}
