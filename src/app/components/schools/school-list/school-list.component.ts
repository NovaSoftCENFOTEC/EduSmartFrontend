import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ISchool, IUser} from "../../../interfaces";
import {ConfirmModalComponent} from "../../confirm-modal/confirm-modal.component";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-school-list',
  standalone: true,
  imports: [
    ConfirmModalComponent,
    DatePipe
  ],
  templateUrl: './school-list.component.html',
  styleUrl: './school-list.component.scss'
})
export class SchoolListComponent {
  @Input() schools: ISchool[] = [];
  @Output() callUpdateModalMethod: EventEmitter<ISchool> = new EventEmitter<ISchool>();
  @Output() callDeleteAction = new EventEmitter<IUser>();
  @Output() callModalAction = new EventEmitter<IUser>();

  deleteSchool: ISchool | null = null;

  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

  openConfirmationModal(school: ISchool): void {
    this.deleteSchool = school;
    this.confirmDeleteModal.show();
  }

  deleteConfirmation(): void {
    if (this.deleteSchool) {
      this.callDeleteAction.emit(this.deleteSchool);
      this.deleteSchool = null;
    }
  }

}
