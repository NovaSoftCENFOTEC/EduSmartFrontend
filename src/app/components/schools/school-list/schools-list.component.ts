import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ISchool, IUser} from "../../../interfaces";
import {ConfirmModalComponent} from "../../confirm-modal/confirm-modal.component";
import {DatePipe} from "@angular/common";
import {RouterLink, RouterModule} from "@angular/router";

@Component({
  selector: 'app-schools-list',
  standalone: true,
  imports: [
    ConfirmModalComponent,
    DatePipe,
    RouterModule
  ],
  templateUrl: './schools-list.component.html',
  styleUrl: './schools-list.component.scss'
})
export class SchoolsListComponent {
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
