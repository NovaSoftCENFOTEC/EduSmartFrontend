import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf } from '@angular/common';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { IGroup, IUser } from '../../interfaces';
import { StudentGroupsService } from '../../services/student-groups.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterComponent } from "../../components/app-layout/elements/footer/footer.component";
import { StudentGroupsListComponent } from "../../components/student-groups/student-groups-list/student-groups-list.component";
import { QuizService } from '../../services/quiz.service';
import { SubmissionService } from '../../services/submission.service';



@Component({
  selector: 'app-student-notes',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    StudentGroupsListComponent,
    NgIf,
    FooterComponent,
    AsyncPipe
  ],
  templateUrl: './student-notes.component.html',
  styleUrls: ['./student-notes.component.scss']
})
export class StudentNotesComponent implements OnInit {
  public groupList: IGroup[] = [];
  public selectedGroupId: number | null = null;
    public selectedGroupTitle: number | null = null;
  public currentStudent: IUser | null = null;
  public studentGroupsService: StudentGroupsService = inject(StudentGroupsService);
  public authService: AuthService = inject(AuthService);
  public route: ActivatedRoute = inject(ActivatedRoute);
  public router = inject(Router);
  public quizService: QuizService = inject(QuizService);
  public submissionService: SubmissionService = inject(SubmissionService);

  public notes: Array<{ title: string; score: number }> = [];

  ngOnInit(): void {
    this.currentStudent = this.authService.getUser() || null;
    if (this.currentStudent && this.currentStudent.id) {
      this.loadGroups();
    }
  }

  loadGroups(): void {
    if (this.currentStudent?.id) {
      this.studentGroupsService.getGroupsByStudent(this.currentStudent.id);
      this.groupList = this.studentGroupsService.groups$();
      
    }
  }

  onGroupClick(groupId: number | undefined): void {
    this.selectedGroupId = typeof groupId === 'number' ? groupId : null;
    this.notes = [];

    if (
      this.selectedGroupId &&
      this.currentStudent &&
      typeof this.currentStudent.id === 'number'
    ) {
      this.quizService.getQuizzesByStory(this.selectedGroupId);

      this.submissionService.getSubmissionsByStudent(this.currentStudent.id).subscribe({
        next: (response) => {
          const submissions = response.data;
       
      
          // Filtra solo los submissions del grupo seleccionado
          const filtered = submissions.filter((submission: any) => {
            
            return Number(submission.quiz?.story?.course?.id) === Number(this.selectedGroupId);
          });
          
          
          this.notes = filtered.map((submission: any) => ({
            title: submission.quiz?.title ?? '',
            score: submission.score ?? 0
          }));
        },
        error: () => {
          this.notes = [];
        }
      });
    } else {
      this.notes = [];
    }
  }



  getNotesForSelectedGroup() {
    console.log('getNotesForSelectedGroup llamado, selectedGroupId:', this.selectedGroupId);
      if (this.selectedGroupId) {
            this.quizService.getQuizzesByStory(this.selectedGroupId);
            console.log('data', this.quizService.getQuizzesByStory(this.selectedGroupId));
        }
    }

  

  goBack() {
    window.history.back();
  }
}