import {Component, inject, OnInit, ViewChild} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {IQuiz} from "../../interfaces";
import {QuizService} from "../../services/quiz.service";
import {ModalService} from "../../services/modal.service";
import {AlertService} from "../../services/alert.service";
import {QuizzesListComponent} from "../../components/quizzes/quiz-list/quizzes-list.component";
import {QuizzesFormComponent} from "../../components/quizzes/quiz-form/quizzes-form.component";
import {ModalComponent} from "../../components/modal/modal.component";
import {PaginationComponent} from "../../components/pagination/pagination.component";
import {QuizViewComponent} from "../../components/quizzes/quiz-view/quiz-view.component";

@Component({
    selector: "app-quizzes",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        QuizzesListComponent,
        QuizzesFormComponent,
        ModalComponent,
        PaginationComponent,
        QuizViewComponent
    ],
    templateUrl: "./quizzes.component.html",
    styleUrl: "./quizzes.component.scss",
})
export class QuizzesComponent implements OnInit {
    @ViewChild("addQuizModal") addQuizModal!: any;
    @ViewChild("editQuizModal") editQuizModal!: any;
    @ViewChild("editConfirmationModal") editConfirmationModal!: any;
    @ViewChild("viewQuizModal") viewQuizModal!: any;

    public storyId: number | null = null;
    public isLoading: boolean = false;
    public selectedQuizId: number | null = null;
    public quizService = inject(QuizService);
    public modalService = inject(ModalService);
    private pendingEditItem: IQuiz | null = null;
    private fb = inject(FormBuilder);
    public quizForm = this.fb.group({
        id: [""],
        title: ["", Validators.required],
        description: ["", Validators.required],
        dueDate: ["", [Validators.required, this.futureDateValidator()]],
        storyId: ["", Validators.required],
        generateWithAI: [false],
        numberOfQuestions: [5, [Validators.min(1), Validators.max(50)]],
    });
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private alertService = inject(AlertService);

    get quizList() {
        return this.quizService.quizzes$();
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            if (params["storyId"]) {
                this.storyId = Number(params["storyId"]);
                this.loadQuizzes();
            }
        });
    }

    saveQuiz(item: IQuiz) {
        this.quizService.saveQuiz(item, this.storyId ?? undefined);
    }

    loadQuizzes() {
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
            item.story = {id: this.storyId};
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

    generateQuestionsForQuiz(quizId: number, numberOfQuestions: number) {
        this.quizService.generateQuestionsForQuiz(quizId, numberOfQuestions);
    }

    viewQuiz(quiz: IQuiz) {
        this.selectedQuizId = quiz.id!;
        this.modalService.displayModal("lg", this.viewQuizModal);
    }

    openEditQuizModal(quiz: IQuiz) {
        this.quizForm.patchValue({
            id: quiz.id ? String(quiz.id) : "",
            title: quiz.title,
            description: quiz.description,
            dueDate: this.convertDateToString(quiz.dueDate ?? null),
            storyId: quiz.story?.id ? String(quiz.story.id) : (this.storyId !== null ? String(this.storyId) : ""),
            generateWithAI: quiz.generateWithAI ?? false,
            numberOfQuestions: quiz.numberOfQuestions ?? 5,
        });
        this.modalService.displayModal("lg", this.editQuizModal);
    }

    openAddQuizModal() {
        this.quizForm.reset();
        if (this.storyId !== null) {
            this.quizForm.patchValue({storyId: this.storyId.toString()});
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
        this.router.navigate(["/app/stories"]);
    }

    convertDateToString(date: Date | string | null): string {
        if (!date) return "";

        let dateObj: Date;

        if (typeof date === "string") {
            if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dateObj = new Date(date);
            } else {
                dateObj = new Date(date);
            }
        } else {
            dateObj = date;
        }

        if (isNaN(dateObj.getTime())) {
            return "";
        }

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
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
                return {pastDate: true};
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
