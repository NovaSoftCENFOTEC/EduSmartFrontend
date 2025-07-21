import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IAssignment } from '../../interfaces';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-assignments-list',
  standalone: true,
  imports: [
    ConfirmModalComponent,
    DatePipe,
    FormsModule
  ],
  templateUrl: './assignments-list.component.html',
  styleUrl: './assignments-list.component.scss'
})
export class AssignmentsListComponent {
  @Input() assignments: IAssignment[] = [];
  @Output() callUpdateModalMethod: EventEmitter<IAssignment> = new EventEmitter<IAssignment>();
  @Output() callDeleteAction = new EventEmitter<IAssignment>();
  @Output() callModalAction = new EventEmitter<IAssignment>();

  deleteAssignment: IAssignment | null = null;
  searchText: string = '';

  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

  get filteredAssignments(): IAssignment[] {
    if (!this.searchText) return this.assignments;
    const lower = this.searchText.toLowerCase();
    return this.assignments.filter(assignment =>
      (assignment.title?.toLowerCase() ?? '').includes(lower) ||
      (assignment.type?.toLowerCase() ?? '').includes(lower) 
    );
  }

  openConfirmationModal(assignment: IAssignment): void {
    this.deleteAssignment = assignment;
    this.confirmDeleteModal.show();
  }

  deleteConfirmation(): void {
    if (this.deleteAssignment) {
      this.callDeleteAction.emit(this.deleteAssignment);
      this.deleteAssignment = null;
    }
  }
}
