import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { FooterComponent } from "../../../components/app-layout/elements/footer/footer.component";
import { TopbarComponent } from "../../../components/app-layout/elements/topbar/topbar.component";
import { ILoginResponse } from "../../../interfaces";
import { AlertService } from "../../../services/alert.service";
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { Subscription } from "rxjs";
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
export class LoginComponent implements OnInit {
  private alertService = inject(AlertService);
  public loginError!: string;
  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;

  public loginForm: { email: string; password: string } = {
    email: "",
    password: "",
  };

  public showPassword = false;

  private socialAuthService = inject(SocialAuthService);
  private socialUser!: SocialUser;
  private loggedIn = false;
  private socialAuthSubscription!: Subscription;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.socialAuthSubscription = this.socialAuthService.authState.subscribe(
      (user) => {
        this.socialUser = user;
        this.loggedIn = user != null;

        if (this.loggedIn) {
          console.log("Usuario de Google autenticado:", this.socialUser);
          this.authService.googleLogin(this.socialUser.idToken).subscribe({
            next: (loggedUser: ILoginResponse) => {
              console.log("Respuesta del backend con JWT:", loggedUser);
              if (loggedUser && loggedUser.authUser.needsPasswordChange) {
                this.router.navigateByUrl("/password-change", {
                  state: { userId: loggedUser.authUser.id },
                });
              } else {
                this.router.navigateByUrl("/app/dashboard");
              }
            },
            error: (err: any) => {
              console.error("Error al enviar token de Google al backend:", err);
              this.alertService.displayAlert(
                "error",
                "Error al iniciar sesión con Google. Inténtalo de nuevo.",
                "center",
                "top",
                ["error-snackbar"]
              );
            },
          });
        }
      },
      (error) => {
        console.error("Error en la suscripción de SocialAuthService:", error);
        this.alertService.displayAlert(
          "error",
          "Error al configurar el inicio de sesión con Google.",
          "center",
          "top",
          ["error-snackbar"]
        );
      }
    );
  }

  ngOnDestroy(): void {
    if (this.socialAuthSubscription) {
      this.socialAuthSubscription.unsubscribe();
    }
  }

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
