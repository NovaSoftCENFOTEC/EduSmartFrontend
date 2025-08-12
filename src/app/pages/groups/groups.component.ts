import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {ICourse, IGroup, IUser} from '../../interfaces';
import {GroupsService} from '../../services/groups.service';
import {ModalService} from '../../services/modal.service';
import {AuthService} from '../../services/auth.service';
import {PaginationComponent} from '../../components/pagination/pagination.component';
import {ModalComponent} from '../../components/modal/modal.component';
import {GroupsFormComponent} from '../../components/groups/group-form/groups-form.component';
import {GroupsListComponent} from '../../components/groups/group-list/groups-list.component';

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
    public teacherId: number | null = null;
    public schoolName: string | null = null;
    public areActionsAvailable: boolean = false;

    public groupsService = inject(GroupsService);
    public fb = inject(FormBuilder);
    public modalService = inject(ModalService);
    public authService = inject(AuthService);
    public route = inject(ActivatedRoute);

    @ViewChild('editGroupModal') public editGroupModal!: any;
    @ViewChild('addGroupModal') public addGroupModal!: any;
    @ViewChild('editConfirmationModal') public editConfirmationModal!: any;

    public groupForm = this.fb.group({
        id: [''],
        name: ['', Validators.required],
        course: [null as ICourse | null, Validators.required],
        students: [[] as IUser[]],
        teacher: [null as IUser | null, Validators.required]
    });

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (!user) return;
        this.teacherId = user.id ?? null;
        this.schoolName = user.school?.name || null;
        this.loadGroups();
        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
        });
    }

    loadGroups(): void {
        if (this.teacherId) {
            this.groupsService.getGroupsByTeacher(this.teacherId);
        }
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
            id: group.id != null ? String(group.id) : null,
            name: group.name,
            course: group.course,
            students: group.students ?? [],
            teacher: group.teacher
        });
        this.modalService.displayModal('lg', this.editGroupModal);
    }

    openAddGroupModal() {
        this.groupForm.reset();
        this.groupForm.patchValue({students: []});
        this.modalService.displayModal('md', this.addGroupModal);
    }

    confirmEdit(item: IGroup) {
        this.modalService.closeAll();
        this.modalService.displayModal('sm', this.editConfirmationModal);
    }

    confirmEditFinal() {
        this.updateGroup(this.groupForm.value as IGroup);
        this.modalService.closeAll();
    }

    cancelEdit() {
        this.modalService.closeAll();
        this.modalService.displayModal('lg', this.editGroupModal);
    }

    goBack() {
        window.history.back();
    }
}
