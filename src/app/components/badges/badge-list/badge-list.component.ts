import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {IBadge} from '../../../interfaces';
import {ConfirmModalComponent} from '../../confirm-modal/confirm-modal.component';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-badge-list',
    standalone: true,
    imports: [FormsModule, CommonModule, ConfirmModalComponent],
    templateUrl: './badge-list.component.html',
    styleUrls: ['./badge-list.component.scss']
})
export class BadgeListComponent {
    @Input() badges: IBadge[] = [];
    @Output() callModalAction = new EventEmitter<IBadge>();
    @Output() callDeleteAction = new EventEmitter<IBadge>();

    deleteBadge: IBadge | null = null;
    searchText: string = '';

    @ViewChild('confirmDeleteModal') confirmDeleteModal!: ConfirmModalComponent;

    enlargedImageUrl: string | null = null;

    get filteredBadges(): IBadge[] {
        if (!this.searchText) return this.badges;
        const lower = this.searchText.toLowerCase();
        return this.badges.filter(
            b =>
                (b.title?.toLowerCase() ?? '').includes(lower) ||
                (b.description?.toLowerCase() ?? '').includes(lower)
        );
    }

    openConfirmationModal(badge: IBadge): void {
        this.deleteBadge = badge;
        this.confirmDeleteModal.show();
    }

    deleteConfirmation(): void {
        if (this.deleteBadge) {
            this.callDeleteAction.emit(this.deleteBadge);
            this.deleteBadge = null;
        }
    }

    trackById(index: number, item: IBadge) {
        return item.id;
    }

    openImageModal(url: string) {
        this.enlargedImageUrl = url;
    }

    closeImageModal() {
        this.enlargedImageUrl = null;
    }
}
