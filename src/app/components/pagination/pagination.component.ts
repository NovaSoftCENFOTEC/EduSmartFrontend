import {CommonModule} from "@angular/common";
import {Component, inject, Input} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {AlertService} from "../../services/alert.service";


@Component({
    selector: "app-pagination",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./pagination.component.html",
    styleUrl: "./pagination.component.scss",
})
export class PaginationComponent {
    @Input() service: any;
    @Input() loadFunction: (() => void) | undefined;

    pageInput: number | null = null;
    private alert = inject(AlertService);

    onPage(pPage: number) {
        if (pPage < 1 || pPage > (this.service.totalPages || 1)) return;

        this.service.page = pPage;
        this.service.pageNumber = pPage;

        if (this.loadFunction) {
            this.loadFunction();
        }

        this.pageInput = null;
    }

    goToPage() {
        if (this.pageInput == null) return;

        const page = Math.floor(this.pageInput);
        if (page >= 1 && page <= (this.service.totalPages || 1)) {
            this.onPage(page);
        } else {
            this.alert.displayAlert('error', `Por favor ingresa un número entre 1 y ${this.service.totalPages}`);
        }
    }
}
