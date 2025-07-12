import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IUser } from '../../../interfaces';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [ConfirmModalComponent, DatePipe, RouterModule, NgForOf, NgIf, FormsModule],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss'
})
export class StudentsListComponent {
  @Input() students: IUser[] = [];
  @Output() callUpdateModalMethod: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() callDeleteAction = new EventEmitter<IUser>();
  @Output() callModalAction = new EventEmitter<IUser>();

  deleteStudent: IUser | null = null;
  searchText: string = '';

  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

  get filteredStudents(): IUser[] {
    if (!this.searchText) return this.students;
    const lower = this.searchText.toLowerCase();
    return this.students.filter(s =>
        (s.name?.toLowerCase() ?? '').includes(lower) ||
        (s.lastname?.toLowerCase() ?? '').includes(lower) ||
        (s.email?.toLowerCase() ?? '').includes(lower)
    );
  }

  openConfirmationModal(student: IUser): void {
    this.deleteStudent = student;
    this.confirmDeleteModal.show();
  }

  deleteConfirmation(): void {
    if (this.deleteStudent) {
      this.callDeleteAction.emit(this.deleteStudent);
      this.deleteStudent = null;
    }
  }
}
