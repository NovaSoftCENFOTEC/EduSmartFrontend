import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ICourse, IGroup, IUser } from '../../interfaces';
import { GroupsService } from '../../services/groups.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { GroupsFormComponent } from '../../components/groups/group-form/groups-form.component';
import { GroupsListComponent } from '../../components/groups/group-list/groups-list.component';

@Component({
    selector: 'app-groups',
    standalone: true,
    imports: [
        PaginationComponent,
        ModalComponent,
        GroupsFormComponent,
        GroupsListComponent
    ],
    templateUrl: './groups.component.html',
    styleUrl: './groups.component.scss'
})
export class GroupsComponent implements OnInit {
    public groupList: IGroup[] = [];
    public areActionsAvailable: boolean = false;
    private pendingEditItem: IGroup | null = null;
    public schoolName: string | null = null;

    public groupsService = inject(GroupsService);
    public fb = inject(FormBuilder);
    public modalService = inject(ModalService);
    public authService = inject(AuthService);
    public route = inject(ActivatedRoute);

    @ViewChild('editGroupModal') public editGroupModal: any;
    @ViewChild('addGroupModal') public addGroupModal: any;
    @ViewChild('editConfirmationModal') public editConfirmationModal: any;

    public groupForm = this.fb.group({
        id: [''],
        name: ['', Validators.required],
        course: [null as ICourse | null, Validators.required],
        students: [[] as IUser[]],
        teacher: [null as IUser | null, Validators.required]
    });

    ngOnInit(): void {
        const user = this.authService.getUser();
        const teacherId = user?.id;

        if (teacherId) {
            this.groupsService.getGroupsByTeacher(teacherId);
            this.schoolName = user.school?.name || null;
        }

        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
        });
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
            course: group.course,
            students: group.students ?? [],
            teacher: group.teacher
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
