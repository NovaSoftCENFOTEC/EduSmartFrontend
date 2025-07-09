import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IUser } from '../../../interfaces';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [ConfirmModalComponent, DatePipe, RouterModule, NgForOf, NgIf],
  templateUrl: './teachers-list.component.html',
  styleUrl: './teachers-list.component.scss'
})
export class TeachersListComponent {
  @Input() teachers: IUser[] = [];
  @Output() callUpdateModalMethod: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() callDeleteAction = new EventEmitter<IUser>();
  @Output() callModalAction = new EventEmitter<IUser>();

  deleteTeacher: IUser | null = null;

  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

  openConfirmationModal(teacher: IUser): void {
    this.deleteTeacher = teacher;
    this.confirmDeleteModal.show();
  }

  deleteConfirmation(): void {
    if (this.deleteTeacher) {
      this.callDeleteAction.emit(this.deleteTeacher);
      this.deleteTeacher = null;
    }
  }
}
