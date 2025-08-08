import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ITaskSubmission } from "../../../interfaces";
import { ConfirmModalComponent } from "../../confirm-modal/confirm-modal.component";
import { DatePipe, NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-task-submission-list",
  standalone: true,
  imports: [ConfirmModalComponent, NgForOf, NgIf, FormsModule, RouterModule, DatePipe],
  templateUrl: "./task-submission-list.component.html",
  styleUrls: ["./task-submission-list.component.scss"]
})
export class TaskSubmissionListComponent {
  @Input() submissions: ITaskSubmission[] = [];
  @Output() callModalAction = new EventEmitter<ITaskSubmission>();
  @Output() callDeleteAction = new EventEmitter<ITaskSubmission>();
  @Input() studentMap: { [id: number]: string } = {};
  
  

  deleteSubmission: ITaskSubmission | null = null;
  searchText: string = "";

  @ViewChild("confirmDeleteModal") confirmDeleteModal!: ConfirmModalComponent;

  get filteredSubmissions(): ITaskSubmission[] {
    if (!this.searchText) return this.submissions;
    const lower = this.searchText.toLowerCase();
    return this.submissions.filter(s =>
      s.comment?.toLowerCase().includes(lower)
    );
  }

  openConfirmationModal(submission: ITaskSubmission): void {
    this.deleteSubmission = submission;
    this.confirmDeleteModal.show();
  }

  deleteConfirmation(): void {
    if (this.deleteSubmission) {
      this.callDeleteAction.emit(this.deleteSubmission);
      this.deleteSubmission = null;
    }
  }

  trackById(index: number, item: ITaskSubmission) {
    return item.id;
  }

  getFileIcon(fileUrl: string): string {
    const fileExtension = fileUrl.split('.').pop()?.toLowerCase();
    switch (fileExtension) {
      case 'pdf': return 'fas fa-file-pdf';
      case 'doc':
      case 'docx': return 'fas fa-file-word';
      case 'xls':
      case 'xlsx': return 'fas fa-file-excel';
      case 'ppt':
      case 'pptx': return 'fas fa-file-powerpoint';
      case 'txt': return 'fas fa-file-alt';
      case 'zip':
      case 'rar': return 'fas fa-file-archive';
      default: return 'fas fa-file';
    }
  }
}