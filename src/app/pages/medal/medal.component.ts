import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeService } from '../../services/badge.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IBadge } from '../../interfaces';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-medal',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './medal.component.html',
  styleUrls: ['./medal.component.scss']
})
export class MedalComponent implements OnInit {
      public route: ActivatedRoute = inject(ActivatedRoute);
      public router = inject(Router);
  public quizzes: { id: number; score: number }[] = [
    { id: 1, score: 90 },
    { id: 2, score: 100   },
    { id: 3, score: 70 }
  ]; // Ejemplo de datos

  constructor(public badgeService: BadgeService) {}

  ngOnInit(): void {
    this.badgeService.getAll();
    // Aquí deberías cargar los quizzes y sus scores del estudiante
    // Por ahora usamos datos de ejemplo arriba
  }

  get medals() {
    return this.badgeService.badges$();
  }

  isUnlocked(medalId: number): boolean {
    const quiz = this.quizzes.find((q: { id: number; score: number }) => q.id === medalId);
    return !!quiz && quiz.score > 70;
  }
    goBack(): void {
        this.router.navigate(['/app/student-groups']);
    }
}
