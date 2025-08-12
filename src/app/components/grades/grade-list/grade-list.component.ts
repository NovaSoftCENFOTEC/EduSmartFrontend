import {Component, EventEmitter, Input, OnInit, Output, ViewChild,} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {ConfirmModalComponent} from "../../confirm-modal/confirm-modal.component";
import {IGrade} from "../../../interfaces";
import {AuthService} from "../../../services/auth.service";
import {NgForOf, NgIf} from "@angular/common";

@Component({
    selector: "app-grade-list",
    standalone: true,
    imports: [ConfirmModalComponent, FormsModule, NgIf, NgForOf],
    templateUrl: "./grade-list.component.html",
    styleUrls: ["./grade-list.component.scss"],
})
export class GradesListComponent implements OnInit {
    @Input() grades: IGrade[] = [];
    @Output() callUpdateModalMethod: EventEmitter<IGrade> =
        new EventEmitter<IGrade>();
    @Output() callDeleteAction = new EventEmitter<IGrade>();
    @Output() callModalAction = new EventEmitter<IGrade>();

    deleteGrade: IGrade | null = null;
    searchText: string = "";
    isStudent: boolean = false;

    @ViewChild("confirmDeleteModal") confirmDeleteModal!: ConfirmModalComponent;

    constructor(private authService: AuthService) {
    }

    get filteredGrades(): IGrade[] {
        if (!this.searchText) return this.grades;
        const lower = this.searchText.toLowerCase();
        return this.grades.filter(
            (grade) =>
                (grade.justification?.toLowerCase() ?? "").includes(lower) ||
                grade.grade?.toString().includes(lower)
        );
    }

    ngOnInit() {
        const user = this.authService.getUser();
        if (user?.role?.name) {
            this.isStudent = user.role.name.toLowerCase() === "student";
        }
    }

    trackById(index: number, item: IGrade) {
        return item.id;
    }

    openConfirmationModal(grade: IGrade): void {
        this.deleteGrade = grade;
        this.confirmDeleteModal.show();
    }

    deleteConfirmation(): void {
        if (this.deleteGrade) {
            this.callDeleteAction.emit(this.deleteGrade);
            this.deleteGrade = null;
        }
    }
}
