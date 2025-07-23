import { Component, ViewChild, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { IAssignment } from "../../interfaces";
import { ModalService } from "../../services/modal.service";
import { AuthService } from "../../services/auth.service";
import { AssignmentsService } from "../../services/assignment.service";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { ModalComponent } from "../../components/modal/modal.component";
import { AssignmentsFormComponent } from "../../components/asignments/assignment-form/assignments-form.component";
import { AssignmentsListComponent } from "../../components/asignments/assignment-list/assignments-list.component";

@Component({
  selector: "app-assignments",
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    ModalComponent,
    AssignmentsFormComponent,
    AssignmentsListComponent,
  ],
  templateUrl: "./assignments.component.html",
  styleUrl: "./assignments.component.scss",
})
export class AssignmentsComponent implements OnInit {
  public areActionsAvailable: boolean = false;
  private pendingEditItem: IAssignment | null = null;
  public groupId: number | null = null;

  public assignmentsService = inject(AssignmentsService);
  public fb = inject(FormBuilder);
  public modalService = inject(ModalService);
  public authService = inject(AuthService);
  public route = inject(ActivatedRoute);

  @ViewChild("editAssignmentModal") public editAssignmentModal: any;
  @ViewChild("addAssignmentModal") public addAssignmentModal: any;
  @ViewChild("editConfirmationModal") public editConfirmationModal: any;

  public assignmentForm = this.fb.group({
    id: [""],
    title: ["", Validators.required],
    description: ["", Validators.required],
    type: ["", Validators.required],
    due_date: ["", Validators.required],
    group_id: ["", Validators.required],
    created_at: [""],
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.groupId = params["groupId"] ? Number(params["groupId"]) : null;
      if (this.groupId !== null) {
        this.assignmentsService.getAssignmentsByGroup(this.groupId);
      } else {
        this.assignmentsService.getAll();
      }
    });

    this.route.data.subscribe((data) => {
      this.areActionsAvailable = this.authService.areActionsAvailable(
        data["authorities"] ?? []
      );
    });
  }
  get assignmentList() {
    return this.assignmentsService.assignments$();
  }

  saveAssignment(item: IAssignment) {
    this.assignmentsService.save(item);
  }

  loadAssignments(): void {
    if (this.groupId) {
      this.assignmentsService.getAssignmentsByGroup(this.groupId);
    } else {
      this.assignmentsService.getAll();
    }
  }

  async handleAddAssignment(item: IAssignment) {
    if (!this.groupId) return;
    item.group = { id: this.groupId };

    try {
      await this.assignmentsService.saveAssignment(item, this.groupId);
      this.modalService.closeAll();
      this.assignmentForm.reset();
      this.loadAssignments();
    } catch (error) {
      console.error("Error al registrar la asignación:", error);
    }
  }
  async updateAssignment(item: IAssignment) {
    if (this.groupId) {
      item.group = { id: this.groupId };
    }

    try {
      await this.assignmentsService.update(item, this.groupId ?? undefined);
      this.modalService.closeAll();
      this.assignmentForm.reset();
      this.loadAssignments();
    } catch (error) {
      console.error("Error al actualizar la asignación:", error);
    }
  }

  async deleteAssignment(item: IAssignment) {
    try {
      await this.assignmentsService.delete(item, this.groupId ?? undefined);
      this.loadAssignments();
    } catch (error) {
      console.error("Error al eliminar la asignación:", error);
    }
  }

  openEditAssignmentModal(assignment: IAssignment) {
    this.assignmentForm.patchValue({
      id: assignment.id ? String(assignment.id) : "",
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      due_date: this.convertDateToString(assignment.dueDate ?? null),
      group_id: assignment.groupId
        ? String(assignment.groupId)
        : this.groupId !== null
          ? String(this.groupId)
          : "",
      created_at: this.convertDateToString(assignment.createdAt ?? null),
    });
    this.modalService.displayModal("lg", this.editAssignmentModal);
  }

  openAddAssignmentModal() {
    this.assignmentForm.reset();
    if (this.groupId !== null) {
      this.assignmentForm.patchValue({ group_id: this.groupId.toString() });
    }
    this.modalService.displayModal("md", this.addAssignmentModal);
  }

  confirmEdit(item: IAssignment) {
    this.pendingEditItem = item;
    this.modalService.closeAll();
    this.modalService.displayModal("sm", this.editConfirmationModal);
  }

  cancelEdit() {
    this.pendingEditItem = null;
    this.modalService.closeAll();
    this.modalService.displayModal("lg", this.editAssignmentModal);
  }

  confirmEditFinal() {
    if (this.pendingEditItem) {
      this.updateAssignment(this.pendingEditItem);
      this.pendingEditItem = null;
    }
  }

  goBack() {
    window.history.back();
  }

  private convertDateToString(date: Date | string | null): string {
    if (!date) return "";
    if (typeof date === "string") return date;
    return date.toISOString().split("T")[0];
  }
}
