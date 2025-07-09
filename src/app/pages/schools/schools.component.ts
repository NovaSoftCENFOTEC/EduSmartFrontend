import {Component, ViewChild, inject} from '@angular/core';

import {PaginationComponent} from '../../components/pagination/pagination.component';
import {ModalComponent} from '../../components/modal/modal.component';
import {ISchool} from '../../interfaces';
import {FormBuilder, Validators} from '@angular/forms';
import {SchoolService} from '../../services/school.service';
import {ModalService} from '../../services/modal.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute} from '@angular/router';
import {SchoolsFormComponent} from "../../components/schools/school-form/schools-form.component";
import {SchoolsListComponent} from "../../components/schools/school-list/schools-list.component";
import {NgIf} from "@angular/common";
import {FooterComponent} from "../../components/app-layout/elements/footer/footer.component";

@Component({
    selector: 'app-schools',
    standalone: true,
    imports: [

        PaginationComponent,
        ModalComponent,
        SchoolsFormComponent,
        SchoolsListComponent,
        NgIf,
        FooterComponent
    ],
    templateUrl: './schools.component.html',
    styleUrl: './schools.component.scss'
})
export class SchoolsComponent {
    public schoolList: ISchool[] = [];
    public schoolService: SchoolService = inject(SchoolService);
    public fb: FormBuilder = inject(FormBuilder);

    public schoolForm = this.fb.group({
        id: [''],
        name: ['', Validators.required],
        domain: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+)$/)]],
        createdAt: ['']
    });

    public modalService: ModalService = inject(ModalService);
    @ViewChild('editSchoolModal') public editSchoolModal: any;
    @ViewChild('addSchoolModal') public addSchoolModal: any;
    @ViewChild('editConfirmationModal') public editConfirmationModal: any;

    public authService: AuthService = inject(AuthService);
    public areActionsAvailable: boolean = false;
    public route: ActivatedRoute = inject(ActivatedRoute);

    private pendingEditItem: ISchool | null = null;

    ngOnInit(): void {
        this.authService.getUserAuthorities();
        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
        });
    }

    constructor() {
        this.schoolService.getAll();
    }

    saveSchool(item: ISchool) {
        this.schoolService.save(item);
    }

    handleAddSchool(item: ISchool) {
        this.saveSchool(item);
        this.modalService.closeAll();
        this.schoolForm.reset();
    }

    updateSchool(item: ISchool) {
        this.schoolService.update(item);
        this.modalService.closeAll();
        this.schoolForm.reset();
    }

    deleteSchool(item: ISchool) {
        this.schoolService.delete(item);
    }

    openEditSchoolModal(school: ISchool) {
        this.schoolForm.patchValue({
            id: JSON.stringify(school.id),
            name: school.name,
            domain: school.domain,
            createdAt: school.createdAt
        });
        this.modalService.displayModal('lg', this.editSchoolModal);
    }

    openAddSchoolModal() {
        this.schoolForm.reset();
        this.modalService.displayModal('md', this.addSchoolModal);
    }


    confirmEdit(item: ISchool) {
        this.pendingEditItem = item;
        this.modalService.closeAll();
        this.modalService.displayModal('sm', this.editConfirmationModal);
    }


    cancelEdit() {
        this.pendingEditItem = null;
        this.modalService.closeAll();
        this.modalService.displayModal('lg', this.editSchoolModal);
    }

    confirmEditFinal() {
        if (this.pendingEditItem) {
            this.updateSchool(this.pendingEditItem);
            this.pendingEditItem = null;
        }
    }

    goBack() {
        window.history.back();
    }


}
