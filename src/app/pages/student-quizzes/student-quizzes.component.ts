import { Component, inject, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, NgIf, DatePipe } from '@angular/common';
import { FooterComponent } from '../../components/app-layout/elements/footer/footer.component';
import { QuizService } from '../../services/quiz.service';
import { GroupStoriesService } from '../../services/group-stories.service';
import { IQuiz } from '../../interfaces';

@Component({
    selector: 'app-student-quizzes',
    standalone: true,
    imports: [
        NgIf,
        FooterComponent,
        AsyncPipe,
        DatePipe
    ],
    templateUrl: './student-quizzes.component.html',
    styleUrl: './student-quizzes.component.scss'
})
export class StudentQuizzesComponent implements OnInit {
    public storyId: number | null = null;
    public groupId: number | null = null;
    public route: ActivatedRoute = inject(ActivatedRoute);
    public router = inject(Router);
    public quizService: QuizService = inject(QuizService);
    public groupStoriesService: GroupStoriesService = inject(GroupStoriesService);

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.storyId = +params['storyId'];
            if (this.storyId) {
                this.loadQuizzes();
                this.getGroupIdFromStory();
            }
        });
    }

    loadQuizzes(): void {
        if (this.storyId) {
            this.quizService.getQuizzesByStoryWithQuestions(this.storyId);
        }
    }

    getGroupIdFromStory(): void {
        this.groupId = this.getGroupIdFromUrl();
    }

    getGroupIdFromUrl(): number | null {
        const currentUrl = this.router.url;
        const groupMatch = currentUrl.match(/group-by-student-id\/(\d+)/);
        if (groupMatch) {
            return +groupMatch[1];
        }

        const storedGroupId = localStorage.getItem('currentGroupId');
        if (storedGroupId) {
            return +storedGroupId;
        }

        return null;
    }

    selectQuiz(quizId: number): void {
        this.router.navigate(['/app/story', this.storyId, 'quiz', quizId]);
    }

    goBack(): void {
        if (this.groupId) {
            this.router.navigate(['/app/group-by-student-id', this.groupId, 'courses']);
        } else {
            this.router.navigate(['/app/student-groups']);
        }
    }

    getAvailableQuizzes() {
        return this.quizService.quizzes$();
    }
} 