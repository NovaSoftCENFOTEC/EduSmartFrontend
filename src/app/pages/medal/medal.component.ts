import {Component, effect, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BadgeService} from '../../services/badge.service';
import {Router} from '@angular/router';
import {IBadge} from '../../interfaces';
import {PaginationComponent} from '../../components/pagination/pagination.component';
import {AuthService} from '../../services/auth.service';

@Component({
    selector: 'app-medal',
    standalone: true,
    imports: [CommonModule, PaginationComponent],
    templateUrl: './medal.component.html',
    styleUrls: ['./medal.component.scss']
})
export class MedalComponent implements OnInit {
    public studentBadgeIds: number[] = [];
    public allBadges: IBadge[] = [];
    public showModal: boolean = false;
    public selectedBadge?: IBadge;
    private studentId?: number;

    constructor(
        public badgeService: BadgeService,
        private router: Router,
        private authService: AuthService
    ) {
        effect(() => {
            this.allBadges = this.badgeService.badges$();
        });

        effect(() => {
            const studentBadges = this.badgeService.studentBadges$();
            this.studentBadgeIds = studentBadges.map((badge: IBadge) => badge.id!).filter((id: number | undefined) => id !== undefined);
        });
    }

    get medals() {
        return this.allBadges;
    }

    ngOnInit(): void {
        const user = this.authService.getUser();
        this.studentId = user?.id;

        this.badgeService.clearStudentBadges();

        this.badgeService.getAll();

        if (typeof this.studentId === 'number') {
            this.badgeService.getBadgesByStudent(this.studentId);
        }
    }

    isUnlocked(medalId: number): boolean {
        return this.studentBadgeIds.includes(medalId);
    }

    goBack(): void {
        this.router.navigate(['/app/student-groups']);
    }

    openModal(badge: IBadge): void {
        this.selectedBadge = badge;
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.selectedBadge = undefined;
    }
}
