import { inject, Injectable, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IResponse, IAudioTrack, VoiceTypeEnum } from "../interfaces";
import { AlertService } from "./alert.service";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class AudioTrackService extends BaseService<IAudioTrack> {
    protected override source: string = "audio-tracks";
    private alertService = inject(AlertService);
    private audioTracksByStorySignal = signal<Map<number, IAudioTrack[]>>(new Map());

    get audioTracksByStory$() {
        return this.audioTracksByStorySignal;
    }

    getAudioTracksByStory(storyId: number, page: number = 1, size: number = 10): Observable<IResponse<IAudioTrack[]>> {
        return this.http.get<IResponse<IAudioTrack[]>>(`${this.source}/story/${storyId}/audio-tracks?page=${page}&size=${size}`);
    }

    createAudioTrack(storyId: number, audioTrack: IAudioTrack): Observable<IResponse<IAudioTrack>> {
        return this.addCustomSource(`story/${storyId}`, audioTrack);
    }

    updateAudioTrack(audioTrackId: number, audioTrack: IAudioTrack): Observable<IResponse<IAudioTrack>> {
        return this.edit(audioTrackId, audioTrack);
    }

    deleteAudioTrack(audioTrackId: number): Observable<IResponse<IAudioTrack>> {
        return this.del(audioTrackId);
    }

    loadAudioTracksForStory(storyId: number): void {
        this.getAudioTracksByStory(storyId).subscribe({
            next: (response: IResponse<IAudioTrack[]>) => {
                const currentMap = this.audioTracksByStorySignal();
                const newMap = new Map(currentMap);
                newMap.set(storyId, response.data);
                this.audioTracksByStorySignal.set(newMap);
            },
            error: () => {
                const currentMap = this.audioTracksByStorySignal();
                const newMap = new Map(currentMap);
                newMap.set(storyId, []);
                this.audioTracksByStorySignal.set(newMap);
            }
        });
    }

    clearAudioTracks(): void {
        this.audioTracksByStorySignal.set(new Map());
    }

    getAudioTracksForStory(storyId: number): IAudioTrack[] {
        const audioTracksMap = this.audioTracksByStorySignal();
        const audioTracks = audioTracksMap.get(storyId) || [];
        return audioTracks;
    }

    getAudioTrackByVoiceType(storyId: number, voiceType: VoiceTypeEnum): IAudioTrack | null {
        const audioTracks = this.getAudioTracksForStory(storyId);
        const audioTrack = audioTracks.find(track => track.voiceType === voiceType) || null;
        return audioTrack;
    }

    hasAudioTracks(storyId: number): boolean {
        const audioTracks = this.getAudioTracksForStory(storyId);
        return audioTracks.length > 0;
    }

    getAvailableVoiceTypes(storyId: number): VoiceTypeEnum[] {
        const audioTracks = this.getAudioTracksForStory(storyId);
        return [...new Set(audioTracks.map(track => track.voiceType))];
    }
} 