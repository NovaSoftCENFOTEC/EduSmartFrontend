import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IStory } from '../../../interfaces';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-story-list',
  standalone: true,
  imports: [ConfirmModalComponent, DatePipe, RouterModule, NgForOf, NgIf, FormsModule],
  templateUrl: './stories-list.component.html',  
  styleUrls: ['./stories-list.component.scss']
})
export class StoryListComponent {
  @Input() stories: IStory[] = [];
  @Output() callUpdateModalMethod = new EventEmitter<IStory>();
  @Output() callDeleteAction = new EventEmitter<IStory>();
  @Output() callModalAction = new EventEmitter<IStory>();

  deleteStory: IStory | null = null;
  searchText: string = '';

  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

  get filteredStories(): IStory[] {
    if (!this.searchText) return this.stories;
    const lower = this.searchText.toLowerCase();
    return this.stories.filter(s =>
      (s.title?.toLowerCase() ?? '').includes(lower) ||
      (s.content?.toLowerCase() ?? '').includes(lower)
    );
  }

  openConfirmationModal(story: IStory): void {
    this.deleteStory = story;
    this.confirmDeleteModal.show();
  }

  deleteConfirmation(): void {
    if (this.deleteStory) {
      this.callDeleteAction.emit(this.deleteStory);
      this.deleteStory = null;
    }
  }
}
