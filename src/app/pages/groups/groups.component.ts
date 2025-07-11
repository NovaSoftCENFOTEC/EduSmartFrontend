import {Component, ViewChild, inject} from '@angular/core';

import {PaginationComponent} from '../../components/pagination/pagination.component';
import {ModalComponent} from '../../components/modal/modal.component';
import {ICourse, IGroup, IUser} from '../../interfaces';
import {FormBuilder, Validators} from '@angular/forms';
import {GroupsService} from '../../services/groups.service';
import {ModalService} from '../../services/modal.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute} from '@angular/router';
import {GroupsFormComponent} from "../../components/groups/group-form/groups-form.component";
import {GroupsListComponent} from "../../components/groups/group-list/groups-list.component";
import {NgIf} from "@angular/common";
import {FooterComponent} from "../../components/app-layout/elements/footer/footer.component";

@Component({
    selector: 'app-groups',
    standalone: true,
    imports: [

        PaginationComponent,
        ModalComponent,
        GroupsFormComponent,
        GroupsListComponent,
        NgIf,
        FooterComponent
    ],
    templateUrl: './groups.component.html',
    styleUrl: './groups.component.scss'
})
export class GroupsComponent {
    public groupList: IGroup[] = [];
    public groupsService: GroupsService = inject(GroupsService);
    public fb: FormBuilder = inject(FormBuilder);

    public groupForm = this.fb.group({
        id: [''],
        name: ['', Validators.required],
        course: [null as ICourse | null, Validators.required],
        students: [[] as IUser[], Validators.required],
        teacher: [null as IUser | null, Validators.required]
    });

    public modalService: ModalService = inject(ModalService);
    @ViewChild('editGroupModal') public editGroupModal: any;
    @ViewChild('addGroupModal') public addGroupModal: any;
    @ViewChild('editConfirmationModal') public editConfirmationModal: any;

    public authService: AuthService = inject(AuthService);
    public areActionsAvailable: boolean = false;
    public route: ActivatedRoute = inject(ActivatedRoute);

    private pendingEditItem: IGroup | null = null;

    ngOnInit(): void {
        this.authService.getUserAuthorities();
        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
        });
    }

    constructor() {
        this.groupsService.getAll();
    }

    saveGroup(item: IGroup) {
        this.groupsService.save(item);
    }

    handleAddGroup(item: IGroup) {
        this.saveGroup(item);
        this.modalService.closeAll();
        this.groupForm.reset();
    }

    updateGroup(item: IGroup) {
        this.groupsService.update(item);
        this.modalService.closeAll();
        this.groupForm.reset();
    }

    deleteGroup(item: IGroup) {
        this.groupsService.delete(item);
    }

    openEditGroupModal(group: IGroup) {
        this.groupForm.patchValue({
            id: group.id !== undefined && group.id !== null ? String(group.id) : null,
            name: group.name,
            course: group.course ?? null,
            students: group.students ?? [],
            teacher: group.teacher ?? null
        });
        this.modalService.displayModal('lg', this.editGroupModal);
    }

    openAddGroupModal() {
        this.groupForm.reset();
        this.groupForm.patchValue({ students: [] });
        this.modalService.displayModal('md', this.addGroupModal);
    }

    confirmEdit(item: IGroup) {
        this.pendingEditItem = item;
        this.modalService.closeAll();
        this.modalService.displayModal('sm', this.editConfirmationModal);
    }

    cancelEdit() {
        this.pendingEditItem = null;
        this.modalService.closeAll();
        this.modalService.displayModal('lg', this.editGroupModal);
    }

    confirmEditFinal() {
        if (this.pendingEditItem) {
            this.updateGroup(this.pendingEditItem);
            this.pendingEditItem = null;
        }
    }
    

    goBack() {
        window.history.back();
    }


}
