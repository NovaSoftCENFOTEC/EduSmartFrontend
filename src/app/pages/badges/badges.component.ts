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
    NgIf,
  ],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss']
})
export class BadgesComponent {
  public badgeService = inject(BadgeService);
  public modalService = inject(ModalService);
  public fb = inject(FormBuilder);

  public form = this.fb.group({
    id: [''],
    title: ['', Validators.required],
    description: ['', Validators.required],
    iconUrl: ['', Validators.required]
  });

  @ViewChild('editBadgeModal') public editBadgeModal: any;
  @ViewChild('addBadgeModal') public addBadgeModal: any;
  @ViewChild('editConfirmationModal') public editConfirmationModal: any;

  protected pendingEditItem: IBadge | null = null;

  ngOnInit(): void {
    this.badgeService.getAll();
  }

  handleAddBadge(item: IBadge) {
    this.badgeService.save(item);
    this.modalService.closeAll();
    this.form.reset();
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
      this.badgeService.update(this.pendingEditItem);
      this.pendingEditItem = null;
      this.modalService.closeAll();
      this.form.reset();
    }
  }

  deleteBadge(item: IBadge) {
    this.badgeService.delete(item);
  }

  openEditBadgeModal(badge: IBadge) {
    this.form.patchValue({
      id: String(badge.id),
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

  goBack() {
    window.history.back();
  }
}
