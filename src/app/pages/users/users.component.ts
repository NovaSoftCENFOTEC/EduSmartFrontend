import {Component, inject, OnInit, ViewChild, WritableSignal} from '@angular/core';
import {ModalComponent} from '../../components/modal/modal.component';
import {PaginationComponent} from '../../components/pagination/pagination.component';
import {UserFormComponent} from '../../components/user/user-from/user-form.component';
import {UserListComponent} from '../../components/user/user-list/user-list.component';
import {IUser} from '../../interfaces';
import {FormBuilder, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {ModalService} from '../../services/modal.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        PaginationComponent,
        ModalComponent,
        UserFormComponent,
        UserListComponent,
    ],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    public userList!: WritableSignal<IUser[]>;

    public userService = inject(UserService);
    public modalService = inject(ModalService);
    public fb = inject(FormBuilder);
    public authService = inject(AuthService);
    public route = inject(ActivatedRoute);

    @ViewChild('addUsersModal') public addUsersModal: any;
    @ViewChild('editUsersModal') public editUsersModal: any;
    @ViewChild('editConfirmationModal') public editConfirmationModal: any;

    public areActionsAvailable: boolean = false;
    userForm = this.fb.group({
        id: [''],
        name: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [''],
        updatedAt: ['']
    });
    private originalUser: IUser | null = null;
    private pendingEditItem: IUser | null = null;

    constructor() {
        this.userList = this.userService.users$;
    }

    ngOnInit(): void {
        this.userService.getAll();
        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
        });
    }

    handleAddUser(user: IUser) {
        this.userService.save(user);
        this.modalService.closeAll();
        this.userForm.reset();
    }

    updateUser() {
        if (!this.originalUser) return;

        const payload: Partial<IUser> = {
            id: this.originalUser.id,
            name: this.userForm.controls['name'].value || '',
            lastname: this.userForm.controls['lastname'].value || ''
        };

        this.userService.update(payload as IUser, () => {
            this.modalService.closeAll();
            this.userForm.reset();
            this.originalUser = null;
            this.userService.getAll();
        });
    }

    deleteUser(user: IUser) {
        if (!user.id) return;

        this.userService.delete(user, () => {
            this.userService.getAll();
        });
    }

    openEditUserModal(user: IUser) {
        this.originalUser = user;
        this.userForm.patchValue({
            id: JSON.stringify(user.id),
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            updatedAt: user.updatedAt
        });
        this.userForm.controls['email'].disable();
        this.modalService.displayModal('lg', this.editUsersModal);
    }

    confirmEdit(item: IUser) {
        this.pendingEditItem = item;
        this.modalService.closeAll();
        this.modalService.displayModal('sm', this.editConfirmationModal);
    }

    cancelEdit() {
        this.pendingEditItem = null;
        this.modalService.closeAll();
        this.modalService.displayModal('lg', this.editUsersModal);
    }

    confirmEditFinal() {
        if (this.pendingEditItem) {
            this.updateUser();
            this.pendingEditItem = null;
        }
    }

    goBack() {
        window.history.back();
    }
}
