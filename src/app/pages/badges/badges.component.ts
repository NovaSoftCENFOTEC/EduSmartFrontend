import { Component, ViewChild, inject } from '@angular/core';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { IBadge } from '../../interfaces';
import { FormBuilder, Validators } from '@angular/forms';
import { BadgeService } from '../../services/badge.service';
import { ModalService } from '../../services/modal.service';
import { BadgeFormComponent } from '../../components/badges/badge-form/badge-form.component';
import { BadgeListComponent } from '../../components/badges/badge-list/badge-list.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [
    PaginationComponent,
    ModalComponent,
    BadgeFormComponent,
    BadgeListComponent,
  ],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss']
})
export class BadgesComponent {
  public badgeService: BadgeService = inject(BadgeService);
  public fb: FormBuilder = inject(FormBuilder);

  public form = this.fb.group({
    id: [''],
    title: ['', Validators.required],
    description: ['', Validators.required],
    iconUrl: ['', Validators.required]
  });

  public modalService: ModalService = inject(ModalService);
  @ViewChild('editBadgeModal') public editBadgeModal: any;
  @ViewChild('addBadgeModal') public addBadgeModal: any;
  @ViewChild('editConfirmationModal') public editConfirmationModal: any;

  protected pendingEditItem: IBadge | null = null;

  ngOnInit(): void {
    this.badgeService.getAll();
  }

  saveBadge(item: IBadge) {
    this.badgeService.save(item);
  }

  handleAddBadge(item: IBadge) {
    this.saveBadge(item);
    this.modalService.closeAll();
    this.form.reset();
  }

  updateBadge(item: IBadge) {
    this.badgeService.update(item, () => {
      this.badgeService.getAll();
      this.modalService.closeAll();
      this.form.reset();
    });
  }

  deleteBadge(item: IBadge) {
    this.badgeService.delete(item, () => {
      this.badgeService.getAll();
    });
  }

  openEditBadgeModal(badge: IBadge) {
    this.form.patchValue({
      id: JSON.stringify(badge.id),
      title: badge.title,
      description: badge.description,
      iconUrl: badge.iconUrl
    });
    this.modalService.displayModal('lg', this.editBadgeModal);
  }

  openAddBadgeModal() {
    this.form.reset();
    this.modalService.displayModal('md', this.addBadgeModal);
  }

  confirmEdit(item: IBadge) {
    this.pendingEditItem = item;
    this.modalService.closeAll();
    this.modalService.displayModal('sm', this.editConfirmationModal);
  }

  cancelEdit() {
    this.pendingEditItem = null;
    this.modalService.closeAll();
    this.modalService.displayModal('lg', this.editBadgeModal);
  }

  confirmEditFinal() {
    if (this.pendingEditItem) {
      this.updateBadge(this.pendingEditItem);
      this.pendingEditItem = null;
    }
  }

  goBack() {
    window.history.back();
  }

}
