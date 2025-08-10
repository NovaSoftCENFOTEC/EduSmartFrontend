import { Component, inject, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { FooterComponent } from '../../components/app-layout/elements/footer/footer.component';
import { GroupStoriesService } from '../../services/group-stories.service';
import { GroupCoursesService } from '../../services/group-courses.service';
import { AudioTrackService } from '../../services/audio-track.service';
import { IAudioTrack, VoiceTypeEnum } from '../../interfaces';

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
    public currentAudio: IAudioTrack | null = null;
    public showAudioPlayer: boolean = false;
    public VoiceTypeEnum = VoiceTypeEnum;

    public route: ActivatedRoute = inject(ActivatedRoute);
    public router = inject(Router);
    public groupStoriesService: GroupStoriesService = inject(GroupStoriesService);
    public groupCoursesService: GroupCoursesService = inject(GroupCoursesService);
    public audioTrackService: AudioTrackService = inject(AudioTrackService);

    constructor() {
        effect(() => {
            const courses = this.groupCoursesService.courses$();
            if (courses.length > 0 && this.groupId) {
                this.courseId = courses[0].id || null;
                if (this.courseId) {
                    this.groupStoriesService.getStoriesByCourse(this.courseId);
                }
            }
        });

        effect(() => {
            const stories = this.groupStoriesService.stories$();
            if (stories.length > 0) {
                this.expandedStories = new Array(stories.length).fill(false);
                stories.forEach(story => {
                    if (story.id) {
                        this.audioTrackService.loadAudioTracksForStory(story.id);
                    }
                });
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
            this.groupStoriesService.clearStories();
            this.groupCoursesService.clearCourses();
            this.audioTrackService.clearAudioTracks();
            this.expandedStories = [];
            this.courseId = null;
            this.groupCoursesService.getCoursesByGroup(this.groupId);
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

    viewQuizzes(storyId: number): void {
        if (this.groupId) {
            localStorage.setItem('currentGroupId', this.groupId.toString());
        }

        this.router.navigate(['/app/story', storyId, 'quizzes']);
    }

    getAudioTrackByVoiceType(storyId: number, voiceType: VoiceTypeEnum): IAudioTrack | null {
        const audioTrack = this.audioTrackService.getAudioTrackByVoiceType(storyId, voiceType);
        return audioTrack;
    }

    hasAudioTracks(storyId: number): boolean {
        const hasTracks = this.audioTrackService.hasAudioTracks(storyId);
        return hasTracks;
    }

    playAudio(storyId: number, voiceType: VoiceTypeEnum): void {
        const audioTrack = this.getAudioTrackByVoiceType(storyId, voiceType);
        this.currentAudio = audioTrack;
        this.showAudioPlayer = true;
    }

    stopAudio(): void {
        this.currentAudio = null;
        this.showAudioPlayer = false;
    }
}