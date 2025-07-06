import { Component, ViewChild, inject } from '@angular/core';

import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { ISchool } from '../../interfaces';
import { FormBuilder, Validators } from '@angular/forms';
import { SchoolService } from '../../services/school.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SchoolFormComponent } from '../../components/schools/schools-form/school-form.component';
import { SchoolListComponent } from '../../components/schools/school-list/school-list.component';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-schools',
  standalone: true,
  imports: [
    SchoolFormComponent,
    SchoolListComponent,
    PaginationComponent,
    ModalComponent,
    LoaderComponent
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
    domain: ['', Validators.required],
    createdAt: ['']
  });

  public modalService: ModalService = inject(ModalService);
  @ViewChild('editSchoolModal') public editSchoolModal: any;
  @ViewChild('addSchoolModal') public addSchoolModal: any;

  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);

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
    this.schoolForm.reset(); // limpiar datos anteriores
    this.modalService.displayModal('md', this.addSchoolModal);
  }
}
