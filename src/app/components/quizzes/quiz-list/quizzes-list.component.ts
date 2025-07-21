import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ConfirmModalComponent } from "../../confirm-modal/confirm-modal.component";
import { IQuiz } from "../../../interfaces";

@Component({
  selector: "app-quiz-list",
  standalone: true,
  imports: [ConfirmModalComponent, DatePipe, FormsModule],
  templateUrl: "./quizzes-list.component.html",
  styleUrl: "./quizzes-list.component.scss",
})
export class QuizzesListComponent {
  @Input() quizzes: IQuiz[] = [];
  @Output() callUpdateModalMethod: EventEmitter<IQuiz> =
    new EventEmitter<IQuiz>();
  @Output() callDeleteAction = new EventEmitter<IQuiz>();
  @Output() callModalAction = new EventEmitter<IQuiz>();

  deleteQuiz: IQuiz | null = null;
  searchText: string = "";

  @ViewChild("confirmDeleteModal") confirmDeleteModal!: ConfirmModalComponent;
  router: any;

  get filteredQuizzes(): IQuiz[] {
    if (!this.searchText) return this.quizzes;
    const lower = this.searchText.toLowerCase();
    return this.quizzes.filter((quiz) =>
      (quiz.title?.toLowerCase() ?? "").includes(lower)
    );
  }

  openConfirmationModal(quiz: IQuiz): void {
    this.deleteQuiz = quiz;
    this.confirmDeleteModal.show();
  }

  deleteConfirmation(): void {
    if (this.deleteQuiz) {
      this.callDeleteAction.emit(this.deleteQuiz);
      this.deleteQuiz = null;
    }
  }
  goToQuizStories(storyId: number | undefined): void {
    if (storyId !== undefined) {
      this.router.navigate(["/app/quizzes"], {
        queryParams: { groupId: storyId.toString() },
      });
    }
  }
}
