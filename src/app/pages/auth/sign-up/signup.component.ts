import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IUser } from '../../../interfaces';
import { FooterComponent } from '../../../components/app-layout/elements/footer/footer.component';
import { TopbarComponent } from '../../../components/app-layout/elements/topbar/topbar.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TopbarComponent, FooterComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SigUpComponent {
  public signUpError!: String;
  public validSignup!: boolean;
  public profilePhotoError: string = '';
  public profilePhotoTouched: boolean = false;

  @ViewChild('name') nameModel!: NgModel;
  @ViewChild('lastname') lastnameModel!: NgModel;
  @ViewChild('email') emailModel!: NgModel;
  @ViewChild('password') passwordModel!: NgModel;

  public showPassword = false;
  public profilePhotoPreview: string | ArrayBuffer | null = null;
  public selectedFile: File | null = null;

  public user: IUser = {
    name: '',
    lastname: '',
    email: '',
    password: '',
    profilePicture: ''
  };

  constructor(private router: Router,
    private authService: AuthService
  ) { }

  public handleSignup(event: Event) {
    event.preventDefault();

    // Validar todos los campos
    if (!this.nameModel.valid) {
      this.nameModel.control.markAsTouched();
    }
    if (!this.lastnameModel.valid) {
      this.lastnameModel.control.markAsTouched();
    }
    if (!this.emailModel.valid) {
      this.emailModel.control.markAsTouched();
    }
    if (!this.passwordModel.valid) {
      this.passwordModel.control.markAsTouched();
    }

    // Validar foto de perfil
    if (!this.selectedFile) {
      this.profilePhotoTouched = true;
      this.profilePhotoError = 'La foto de perfil es obligatoria.';
      return;
    }

    // Si todos los campos son válidos, proceder con el registro
    if (this.emailModel.valid && this.passwordModel.valid && this.nameModel.valid &&
      this.lastnameModel.valid && this.selectedFile && !this.profilePhotoError) {
      this.authService.signup(this.user).subscribe({
        next: () => this.validSignup = true,
        error: (err: any) => (this.signUpError = err.description),
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.profilePhotoError = '';
    this.profilePhotoTouched = true;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tipo de archivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.profilePhotoError = 'Solo se permiten imágenes PNG, JPG o JPEG.';
        this.selectedFile = null;
        this.profilePhotoPreview = null;
        return;
      }

      // Validar tamaño (opcional, máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.profilePhotoError = 'La imagen debe ser menor a 5MB.';
        this.selectedFile = null;
        this.profilePhotoPreview = null;
        return;
      }

      this.selectedFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = e => {
        this.profilePhotoPreview = reader.result;
      };
      reader.readAsDataURL(file);

      // Actualizar el usuario con la foto
      this.user.profilePicture = file.name;
    } else {
      this.selectedFile = null;
      this.profilePhotoPreview = null;
      this.user.profilePicture = '';
    }
  }
}
