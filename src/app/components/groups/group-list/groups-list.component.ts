import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { IGroup, IUser } from "../../../interfaces";
import { ConfirmModalComponent } from "../../confirm-modal/confirm-modal.component";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-groups-list",
  standalone: true,
  imports: [ConfirmModalComponent, RouterModule, FormsModule],
  templateUrl: "./groups-list.component.html",
  styleUrl: "./groups-list.component.scss",
})
export class GroupsListComponent {
  @Input() groups: IGroup[] = [];
  @Output() callUpdateModalMethod: EventEmitter<IGroup> =
    new EventEmitter<IGroup>();
  @Output() callDeleteAction = new EventEmitter<IUser>();
  @Output() callModalAction = new EventEmitter<IUser>();

  deleteGroup: IGroup | null = null;
  searchText: string = "";

  @ViewChild("confirmDeleteModal") confirmDeleteModal!: ConfirmModalComponent;
    constructor(private router: Router) {}

  get filteredGroups(): IGroup[] {
    if (!this.searchText) return this.groups;
    const lower = this.searchText.toLowerCase();
    return this.groups.filter(
      (g) =>
        (g.name?.toLowerCase() ?? "").includes(lower) ||
        (g.course?.title?.toLowerCase() ?? "").includes(lower) ||
        (g.teacher?.name?.toLowerCase() ?? "").includes(lower)
    );
  }

  openConfirmationModal(group: IGroup): void {
    this.deleteGroup = group;
    this.confirmDeleteModal.show();
  }

  deleteConfirmation(): void {
    if (this.deleteGroup) {
      this.callDeleteAction.emit(this.deleteGroup);
      this.deleteGroup = null;
    }
  }
  
  goToGroupAssignments(groupId: number | undefined): void {
  if (groupId !== undefined) {
    this.router.navigate(['/app/assignments'], {
      queryParams: { groupId: groupId.toString() }
    });
  }
}
}
