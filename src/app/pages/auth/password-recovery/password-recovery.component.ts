import {CommonModule} from "@angular/common";
import {Component, ViewChild} from "@angular/core";
import {FooterComponent} from "../../../components/app-layout/elements/footer/footer.component";
import {TopbarComponent} from "../../../components/app-layout/elements/topbar/topbar.component";
import {FormsModule, NgModel} from "@angular/forms";
import {UserService} from "../../../services/user.service";
import {ModalService} from "../../../services/modal.service";

@Component({
    selector: "app-password-recovery",
    standalone: true,
    imports: [CommonModule, FormsModule, TopbarComponent, FooterComponent],
    templateUrl: "./password-recovery.component.html",
    styleUrl: "./password-recovery.component.scss",
})
export class PasswordRecoveryComponent {
    public passRecoveryError!: string;
    @ViewChild("email") emailModel!: NgModel;
    @ViewChild("infoModal") infoModal!: any;

    public recoveryForm: { email: string } = {
        email: "",
    };

    constructor(
        private userService: UserService,
        private modalService: ModalService
    ) {
    }

    public handlePasswordRecovery(event: Event) {
        event.preventDefault();
        if (!this.emailModel.valid) {
            this.emailModel.control.markAsTouched();
        }
        if (this.emailModel.valid) {
            this.userService.passwordRecovery(this.recoveryForm.email);
            this.modalService.displayModal("sm", this.infoModal);
            this.recoveryForm.email = "";
        }
    }

    closeInfoModal() {
        this.modalService.closeAll();
    }
}
