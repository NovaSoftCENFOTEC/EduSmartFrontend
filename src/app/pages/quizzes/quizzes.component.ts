import { Component, ViewChild, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { IQuiz } from "../../interfaces";
import { ModalService } from "../../services/modal.service";
import { AuthService } from "../../services/auth.service";
import { QuizService } from "../../services/quiz.service";
import { AlertService } from "../../services/alert.service";
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
  public isLoading: boolean = false;

  public quizService = inject(QuizService);
  public modalService = inject(ModalService);
  public authService = inject(AuthService);
  public route = inject(ActivatedRoute);
  public fb: FormBuilder = inject(FormBuilder);
  private alertService = inject(AlertService);

  public quizForm = this.fb.group({
    id: [""],
    title: ["", Validators.required],
    description: ["", Validators.required],
    dueDate: ["", [Validators.required, this.futureDateValidator()]],
    storyId: ["", Validators.required],
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
    if (!this.isValidDueDate(item.dueDate)) {
      this.alertService.displayAlert(
        "error",
        "La fecha de entrega no puede ser anterior a la fecha actual.",
        "center",
        "top",
        ["error-snackbar"]
      );
      return;
    }
    this.isLoading = true;
    const subscription = this.quizService.quizCreated$.subscribe(() => {
      this.isLoading = false;
      this.modalService.closeAll();
      this.quizForm.reset();
      subscription.unsubscribe();
    });
    this.quizService.createQuizForStory(item, this.storyId);
  }

  async updateQuiz(item: IQuiz) {
    if (this.storyId) {
      item.story = { id: this.storyId };
    }
    if (!this.isValidDueDate(item.dueDate)) {
      this.alertService.displayAlert(
        "error",
        "La fecha de entrega no puede ser anterior a la fecha actual.",
        "center",
        "top",
        ["error-snackbar"]
      );
      return;
    }
    this.isLoading = true;
    const subscription = this.quizService.quizUpdated$.subscribe(() => {
      this.isLoading = false;
      this.modalService.closeAll();
      this.quizForm.reset();
      this.loadQuizzes();
      subscription.unsubscribe();
    });

    this.quizService.update(item, this.storyId ?? undefined);
  }

  async deleteQuiz(item: IQuiz) {
    try {
      await this.quizService.delete(item, this.storyId ?? undefined);
      this.loadQuizzes();
    } catch (error) {
      console.error("Error al eliminar el quiz:", error);
    }
  }

  generateQuestionsForQuiz(quizId: number, numberOfQuestions: number) {
    this.quizService.generateQuestionsForQuiz(quizId, numberOfQuestions);
  }

  openEditQuizModal(quiz: IQuiz) {
    this.quizForm.patchValue({
      id: quiz.id ? String(quiz.id) : "",
      title: quiz.title,
      description: quiz.description,
      dueDate: this.convertDateToString(quiz.dueDate ?? null),
      storyId: quiz.story?.id
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
      this.quizForm.patchValue({ storyId: this.storyId.toString() });
    }
    const today = new Date().toISOString().split('T')[0];
    this.quizForm.patchValue({ dueDate: today });
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

  private futureDateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return { pastDate: true };
      }
      return null;
    };
  }

  private isValidDueDate(dueDate: Date | string | null): boolean {
    if (!dueDate) return false;
    const selectedDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }
}
