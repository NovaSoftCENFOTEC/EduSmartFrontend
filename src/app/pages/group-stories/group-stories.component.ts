import { Component, inject, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { FooterComponent } from '../../components/app-layout/elements/footer/footer.component';
import { GroupStoriesService } from '../../services/group-stories.service';
import { GroupCoursesService } from '../../services/group-courses.service';
import { ICourse } from '../../interfaces';

@Component({
    selector: 'app-group-stories',
    standalone: true,
    imports: [
        NgIf,
        FooterComponent,
        AsyncPipe
    ],
    templateUrl: './group-stories.component.html',
    styleUrl: './group-stories.component.scss'
})
export class GroupStoriesComponent implements OnInit {
    public groupId: number | null = null;
    public courseId: number | null = null;
    public expandedStories: boolean[] = [];
    public route: ActivatedRoute = inject(ActivatedRoute);
    public router = inject(Router);
    public groupStoriesService: GroupStoriesService = inject(GroupStoriesService);
    public groupCoursesService: GroupCoursesService = inject(GroupCoursesService);

    constructor() {
        effect(() => {
            const stories = this.groupStoriesService.stories$();
            if (stories.length > 0) {
                this.expandedStories = new Array(stories.length).fill(false);
            }
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.groupId = +params['groupId'];
            if (this.groupId) {
                this.loadCourseAndStories();
            }
        });
    }

    loadCourseAndStories(): void {
        if (this.groupId) {
            this.groupCoursesService.getCoursesByGroup(this.groupId);
            const courses = this.groupCoursesService.courses$();
            if (courses.length > 0) {
                this.courseId = courses[0].id || null;
                if (this.courseId) {
                    this.groupStoriesService.getStoriesByCourse(this.courseId);
                }
            }
        }
    }

    toggleStory(index: number): void {
        if (this.expandedStories[index] !== undefined) {
            this.expandedStories[index] = !this.expandedStories[index];
        }
    }

    goBack(): void {
        this.router.navigate(['/app/student-groups']);
    }
}