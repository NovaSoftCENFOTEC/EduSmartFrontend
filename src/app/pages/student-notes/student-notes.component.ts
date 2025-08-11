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
      
       this.groupList.forEach(group => {
      
    });
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
      const quizzes = this.quizService.quizzes$();

      this.submissionService.getSubmissionsByStudent(this.currentStudent.id).subscribe({
        next: (response) => {
          const submissions = response.data;
          quizzes.forEach(quiz => {
            const submission = submissions.find((s: any) => s.quiz?.id === quiz.id);
            if (submission && submission.id) {
              this.submissionService.getSubmissionResults(submission.id).subscribe({
                next: (resultResponse) => {
                  const result = resultResponse.data;
                  this.notes.push({
                    title: quiz.title ?? '',
                    score: result?.score ?? 0
                  });
                },
                error: () => {
                  this.notes.push({
                    title: quiz.title ?? '',
                    score: 0
                  });
                }
              });
            } else {
              this.notes.push({
                title: quiz.title ?? '',
                score: 0
              });
            }
          });
        },
        error: () => {
          quizzes.forEach(quiz => {
            this.notes.push({
              title: quiz.title ?? '',
              score: 0
            });
          });
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