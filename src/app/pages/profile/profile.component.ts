import {Component, effect, inject, OnInit, ViewChild} from "@angular/core";
import {ProfileService} from "../../services/profile.service";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators,} from "@angular/forms";
import {AlertService} from "../../services/alert.service";
import {ChangePasswordComponent} from "../../components/change-password/change-password.component";
import {IUser} from "../../interfaces";
import {ModalComponent} from "../../components/modal/modal.component";
import {ModalService} from "../../services/modal.service";

const MAX_BADGE_IMAGE_SIZE = 10 * 1024 * 1024;

type PendingAction = "saveProfile" | "changePassword";

@Component({
    selector: "app-profile",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalComponent,
        ChangePasswordComponent,
    ],
    templateUrl: "./profile.component.html",
    styleUrl: "./profile.component.scss",
})
export class ProfileComponent implements OnInit {
    public profileService = inject(ProfileService);
    public modalService = inject(ModalService);
    @ViewChild("name") nameModel!: NgModel;
    @ViewChild("lastname") lastnameModel!: NgModel;
    @ViewChild("changePasswordModal") changePasswordModal!: any;
    public profileForm: {
        name: string;
        lastname: string;
        profilePicture: string | null;
    } = {
        name: "",
        lastname: "",
        profilePicture: null,
    };
    public changePasswordForm: FormGroup;
    public confirmationMessage: string = "";
    @ViewChild("confirmationModal") confirmationModal!: any;
    private alertService = inject(AlertService);
    private fb = inject(FormBuilder);
    private pendingAction: PendingAction | null = null;
    private pendingPasswordEvent: IUser | null = null;

    constructor() {
        this.profileService.getUserInfoSignal();

        effect(() => {
            const user = this.profileService.user$();
            if (user) {
                this.profileForm.name = user.name || "";
                this.profileForm.lastname = user.lastname || "";
                this.profileForm.profilePicture = user.profilePic || null;
                if (this.changePasswordForm && user.id) {
                    this.changePasswordForm.patchValue({id: user.id});
                }
            }
        });

        this.changePasswordForm = this.fb.group({
            id: [null],
            password: ["", Validators.required],
            confirmPassword: ["", Validators.required],
        });
    }

    ngOnInit(): void {
    }

    onRequestSaveProfile(event: Event) {
        event.preventDefault();
        this.confirmationMessage =
            "¿Está seguro que desea guardar los cambios en su perfil?";
        this.pendingAction = "saveProfile";
        this.modalService.displayModal("md", this.confirmationModal);
    }

    onRequestConfirmChangePassword(event: IUser) {
        this.modalService.closeAll();
        setTimeout(() => {
            this.confirmationMessage =
                "¿Está seguro que desea cambiar su contraseña?";
            this.pendingAction = "changePassword";
            this.pendingPasswordEvent = event;
            this.modalService.displayModal("md", this.confirmationModal);
        }, 200);
    }

    onRequestChangePassword() {
        this.openChangePasswordModal();
    }

    confirmAction() {
        if (this.pendingAction === "saveProfile") {
            this.handleUpdateUser(new Event("submit"));
        } else if (
            this.pendingAction === "changePassword" &&
            this.pendingPasswordEvent
        ) {
            this.handleChangePassword(this.pendingPasswordEvent);
            this.pendingPasswordEvent = null;
        }
        this.closeConfirmationModal();
        this.pendingAction = null;
    }

    closeConfirmationModal() {
        this.modalService.closeAll();
        this.pendingAction = null;
        this.pendingPasswordEvent = null;
    }

    handleUpdateUser(event: Event) {
        event.preventDefault();
        const user = this.profileService.user$();
        if (user && user.id) {
            this.profileService.updateUser(user.id, {
                name: this.profileForm.name,
                lastname: this.profileForm.lastname,
                profilePic: this.profileForm.profilePicture ?? undefined,
            });
        }
    }

    openUploadWidget(): void {
        const widget = (window as any).cloudinary.createUploadWidget(
            {
                cloudName: "dghnoosr7",
                uploadPreset: "EduSmart",
                sources: ["local", "url", "camera"],
                multiple: false,
                resourceType: "image",
                clientAllowedFormats: ["jpg", "png", "jpeg", "gif", "webp", "bmp"],
                maxFileSize: MAX_BADGE_IMAGE_SIZE,
                styles: {
                    palette: {
                        window: "#ffffff",
                        windowBorder: "#90A0B3",
                        tabIcon: "#003E6B",
                        menuIcons: "#5A616A",
                        textDark: "#000000",
                        textLight: "#FFFFFF",
                        link: "#1E8B9B",
                        action: "#003E6B",
                        inactiveTabIcon: "#69778A",
                        error: "#A83A15",
                        inProgress: "#003E6B",
                        complete: "#20B832",
                        progressBar: "#1E8B9B",
                    },
                    fonts: {
                        default: null,
                        "'Roboto', sans-serif": {
                            url: "https://fonts.googleapis.com/css?family=Roboto",
                            active: true,
                        },
                    },
                },
            },
            (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    const url = result.info.secure_url;
                    if (url && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url)) {
                        this.profileForm.profilePicture = url;
                        this.alertService.displayAlert(
                            "success",
                            "La imagen de perfil se ha subido correctamente. Por favor, guarde los cambios.",
                            "center",
                            "top",
                            ["success-snackbar"]
                        );
                    } else {
                        this.alertService.displayAlert(
                            "error",
                            "Solo se permiten archivos de imagen válidos (jpg, png, gif, etc).",
                            "center",
                            "top",
                            ["error-snackbar"]
                        );
                    }
                }
            }
        );
        widget.open();
    }

    openChangePasswordModal() {
        this.changePasswordForm.reset();
        const user = this.profileService.user$();
        if (user && user.id) {
            this.changePasswordForm.patchValue({id: user.id});
        }
        this.modalService.displayModal("md", this.changePasswordModal);
    }

    handleChangePassword(event: IUser) {
        this.profileService.changePassword(event.id!, event.password!);
        this.modalService.closeAll();
    }
}
