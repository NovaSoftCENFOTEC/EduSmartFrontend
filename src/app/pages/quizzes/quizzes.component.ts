import { Component, ViewChild, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { IQuiz } from "../../interfaces";
import { ModalService } from "../../services/modal.service";
import { AuthService } from "../../services/auth.service";
import { QuizService } from "../../services/quiz.service";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { ModalComponent } from "../../components/modal/modal.component";
import { QuizzesFormComponent } from "../../components/quizzes/quiz-form/quizzes-form.component";
import { QuizzesListComponent } from "../../components/quizzes/quiz-list/quizzes-list.component";

@Component({
  selector: "app-quizzes",
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    ModalComponent,
    QuizzesFormComponent,
    QuizzesListComponent,
  ],
  templateUrl: "./quizzes.component.html",
  styleUrls: ["./quizzes.component.scss"],
})
export class QuizzesComponent implements OnInit {
  public areActionsAvailable: boolean = false;
  private pendingEditItem: IQuiz | null = null;
  public storyId: number | null = null;

  public quizService = inject(QuizService);
  public modalService = inject(ModalService);
  public authService = inject(AuthService);
  public route = inject(ActivatedRoute);
  public fb: FormBuilder = inject(FormBuilder);

  public quizForm = this.fb.group({
    id: [""],
    title: ["", Validators.required],
    description: ["", Validators.required],
    due_date: ["", Validators.required],
    story_id: ["", Validators.required],
    generateWithAI: [false],
    numberOfQuestions: [5, [Validators.min(1), Validators.max(50)]],
  });
  @ViewChild("editQuizModal") public editQuizModal: any;
  @ViewChild("addQuizModal") public addQuizModal: any;
  @ViewChild("editConfirmationModal") public editConfirmationModal: any;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.storyId = params["storyId"] ? Number(params["storyId"]) : null;
      if (this.storyId !== null) {
        this.quizService.getQuizzesByStory(this.storyId);
      } else {
        this.quizService.getAll();
      }
    });

    this.route.data.subscribe((data) => {
      this.areActionsAvailable = this.authService.areActionsAvailable(
        data["authorities"] ?? []
      );
    });
  }

  get quizList() {
    return this.quizService.quizzes$();
  }

  saveQuiz(item: IQuiz) {
    this.quizService.saveQuiz(item);
  }

  loadQuizzes(): void {
    if (this.storyId) {
      this.quizService.getQuizzesByStory(this.storyId);
    } else {
      this.quizService.getAll();
    }
  }

  async handleAddQuiz(item: IQuiz) {
    if (!this.storyId) return;
    item.story = { id: this.storyId };

    try {
      await this.quizService.saveQuiz(item, this.storyId);
      this.modalService.closeAll();
      this.quizForm.reset();
      this.loadQuizzes();
    } catch (error) {
      console.error("Error al registrar el quiz:", error);
    }
  }

  async updateQuiz(item: IQuiz) {
    if (this.storyId) {
      item.story = { id: this.storyId };
    }

    try {
      await this.quizService.update(item, this.storyId ?? undefined);
      this.modalService.closeAll();
      this.quizForm.reset();
      this.loadQuizzes();
    } catch (error) {
      console.error("Error al actualizar el quiz:", error);
    }
  }

  async deleteQuiz(item: IQuiz) {
    try {
      await this.quizService.delete(item, this.storyId ?? undefined);
      this.loadQuizzes();
    } catch (error) {
      console.error("Error al eliminar el quiz:", error);
    }
  }

  openEditQuizModal(quiz: IQuiz) {
    this.quizForm.patchValue({
      id: quiz.id ? String(quiz.id) : "",
      title: quiz.title,
      description: quiz.description,
      due_date: this.convertDateToString(quiz.dueDate ?? null),
      story_id: quiz.story?.id
        ? String(quiz.story.id)
        : this.storyId !== null
        ? String(this.storyId)
        : "",
      generateWithAI: quiz.generateWithAI ?? false,
      numberOfQuestions: quiz.numberOfQuestions ?? 5,
    });
    this.modalService.displayModal("lg", this.editQuizModal);
  }

  openAddQuizModal() {
    this.quizForm.reset();
    if (this.storyId !== null) {
      this.quizForm.patchValue({ story_id: this.storyId.toString() });
    }
    this.modalService.displayModal("md", this.addQuizModal);
  }

  confirmEdit(item: IQuiz) {
    this.pendingEditItem = item;
    this.modalService.closeAll();
    this.modalService.displayModal("sm", this.editConfirmationModal);
  }

  cancelEdit() {
    this.pendingEditItem = null;
    this.modalService.closeAll();
    this.modalService.displayModal("lg", this.editQuizModal);
  }

  confirmEditFinal() {
    if (this.pendingEditItem) {
      this.updateQuiz(this.pendingEditItem);
      this.pendingEditItem = null;
    }
  }

  goBack() {
    window.history.back();
  }

  private convertDateToString(date: Date | string | null): string {
    if (!date) return "";
    if (typeof date === "string") return date;
    return date.toISOString().split("T")[0];
  }
}
