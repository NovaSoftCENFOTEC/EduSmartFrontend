import { Component, OnInit, ViewChild, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { MaterialService } from '../../services/material.service';
import { IMaterial } from '../../interfaces';
import { MaterialsFormComponent } from "../../components/material/materials-form/materials-form.component";
import { MaterialListComponent } from "../../components/material/materials-list/materials-list.component";

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    ModalComponent,
    MaterialsFormComponent,
    MaterialListComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {
  public materials!: WritableSignal<IMaterial[]>;
  public materialService = inject(MaterialService);
  public modalService = inject(ModalService);
  public authService = inject(AuthService);
  public fb = inject(FormBuilder);
  public route = inject(ActivatedRoute);

  private courseId: number | null = null;
  private originalMaterial: IMaterial | null = null;
  private pendingEditItem: IMaterial | null = null;

  @ViewChild('editMaterialModal') public editMaterialModal: any;
  @ViewChild('addMaterialModal') public addMaterialModal: any;
  @ViewChild('editConfirmationModal') public editConfirmationModal: any;

  materialForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    fileUrl: ['', Validators.required],
    course: [null],
    teacher: [null]
  });

  constructor() {
    this.materials = this.materialService.materials$;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = Number(params['courseId']);
      if (id) {
        this.courseId = id;
        sessionStorage.setItem('courseId', id.toString());
        this.materialService.setCurrentCourseId(id);
      } else {
        const storedId = sessionStorage.getItem('courseId');
        this.courseId = storedId ? Number(storedId) : null;
        this.materialService.setCurrentCourseId(this.courseId);
      }
      this.loadMaterials();
    });
  }

  loadMaterials(): void {
    if (this.courseId) {
      this.materialService.getByCourse(this.courseId);
    }
  }

  handleAddMaterial(item: IMaterial) {
    const teacher = this.authService.getUser();
    const courseId = this.courseId;
    const teacherId = teacher?.id;

    if (courseId == null || teacherId == null) return;

    const payload: Partial<IMaterial> = {
      name: item.name,
      fileUrl: item.fileUrl,
      uploadedAt: new Date().toISOString()
    };

    this.materialService.save(payload as IMaterial, courseId, teacherId);
    this.modalService.closeAll();
    this.materialForm.reset();
  }

  updateMaterial() {
    if (!this.originalMaterial) return;

    const payloadToSend: IMaterial = {
      id: this.originalMaterial.id,
      name: this.materialForm.controls['name'].value || '',
      fileUrl: this.materialForm.controls['fileUrl'].value || '',
      uploadedAt: this.originalMaterial.uploadedAt,
      course: this.originalMaterial.course ? { id: this.originalMaterial.course.id } : null,
      teacher: this.originalMaterial.teacher ? { id: this.originalMaterial.teacher.id } : null
    };

    this.materialService.update(payloadToSend, () => {
      this.modalService.closeAll();
      this.materialForm.reset();
      this.originalMaterial = null;
    });
  }

  deleteMaterial(item: IMaterial) {
    if (!this.courseId || !item.id) return;
    this.materialService.delete(item);
  }

  openEditMaterialModal(material: IMaterial) {
    this.originalMaterial = material;
    this.materialForm.patchValue({
      id: JSON.stringify(material.id) ,
      name: material.name,
      fileUrl: material.fileUrl
    });
    this.modalService.displayModal('lg', this.editMaterialModal);
  }

  openAddMaterialModal() {
    this.materialForm.reset();
    this.modalService.displayModal('md', this.addMaterialModal);
  }

  confirmEdit(item: IMaterial) {
    this.pendingEditItem = item;
    this.modalService.closeAll();
    this.modalService.displayModal('sm', this.editConfirmationModal);
  }

  cancelEdit() {
    this.pendingEditItem = null;
    this.modalService.closeAll();
    this.modalService.displayModal('lg', this.editMaterialModal);
  }

  confirmEditFinal() {
    if (this.pendingEditItem) {
      this.updateMaterial();
      this.pendingEditItem = null;
    }
  }

  goBack() {
    window.history.back();
  }
}