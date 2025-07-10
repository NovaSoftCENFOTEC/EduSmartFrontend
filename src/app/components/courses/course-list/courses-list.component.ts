import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ICourse, IUser} from "../../../interfaces";
import {ConfirmModalComponent} from "../../confirm-modal/confirm-modal.component";
import {DatePipe} from "@angular/common";
import {RouterLink, RouterModule} from "@angular/router";

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [
    ConfirmModalComponent,
    DatePipe,
    RouterModule
  ],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.scss'
})
export class CoursesListComponent {
  @Input() courses: ICourse[] = [];
  @Output() callUpdateModalMethod: EventEmitter<ICourse> = new EventEmitter<ICourse>();
  @Output() callDeleteAction = new EventEmitter<ICourse>();
  @Output() callModalAction = new EventEmitter<ICourse>();

  deleteCourse: ICourse | null = null;

  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

  openConfirmationModal(course: ICourse): void {
    this.deleteCourse = course;
    this.confirmDeleteModal.show();
  }

  deleteConfirmation(): void {
    if (this.deleteCourse) {
      this.callDeleteAction.emit(this.deleteCourse);
      this.deleteCourse = null;
    }
  }

}
