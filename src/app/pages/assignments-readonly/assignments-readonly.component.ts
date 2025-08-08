import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssignmentsService } from '../../services/assignment.service';
import { IAssignment } from '../../interfaces';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { AssignmentsListComponent } from '../../components/asignments/assignment-list/assignments-list.component';

@Component({
  selector: 'app-assignments-readonly',
  standalone: true,
  templateUrl: './assignments-readonly.component.html',
  styleUrls: ['./assignments-readonly.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent,
    AssignmentsListComponent,
  ],
})
export class AssignmentsReadOnlyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  public assignmentsService = inject(AssignmentsService);

  public assignments = this.assignmentsService.assignments$;
  public searchText = '';
  private groupId: number | null = null;
  private router = inject(Router)


  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const idFromQuery = Number(params['groupId']);
      if (idFromQuery) {
        this.setGroupId(idFromQuery);
      } else {
       
        if (this.assignmentsService['currentGroupId']) {
         
          this.groupId = this.assignmentsService['currentGroupId'];
          this.assignmentsService.getAssignmentsByGroup(this.groupId);
        } else {
          const saved = localStorage.getItem('lastGroupId');
          if (saved) {
            const fallback = Number(saved);
            if (fallback) {
              this.setGroupId(fallback);
            }
          }
        }
      }
    });
  }

  private setGroupId(id: number) {
    this.groupId = id;
    this.assignmentsService.setCurrentGroupId(id);
    this.assignmentsService.getAssignmentsByGroup(id);
  }

  goBack(): void {
    this.location.back();
  }

  filteredAssignments(): IAssignment[] {
    const all = this.assignments();
    if (!this.searchText) return all;

    const lower = this.searchText.toLowerCase();

    return all.filter((assignment) => {
      const titleMatch = assignment.title?.toLowerCase().includes(lower);
      const descMatch = assignment.description?.toLowerCase().includes(lower);
      const typeMatch = assignment.type?.toLowerCase().includes(lower);
      const dateMatch = this.convertDateToString(assignment.dueDate)
        .toLowerCase()
        .includes(lower);
      return Boolean(titleMatch || descMatch || typeMatch || dateMatch);
    });
  }

  private convertDateToString(date: Date | string | null): string {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return new Date(date).toISOString().split('T')[0];
  }
  verDetalles(assignmentId?: number): void {
  if (!assignmentId) {
    console.warn('Assignment ID no disponible.');
    return;
  }

  this.router.navigate(['app/task-submission'], {
    queryParams: { assignmentId }
  });
}
}
