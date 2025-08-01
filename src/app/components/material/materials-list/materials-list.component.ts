import {Component, EventEmitter, Input, Output, ViewChild,} from "@angular/core";
import {IMaterial} from "../../../interfaces";
import {ConfirmModalComponent} from "../../confirm-modal/confirm-modal.component";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
    selector: "app-materials-list",
    standalone: true,
    imports: [ConfirmModalComponent, NgForOf, NgIf, FormsModule, DatePipe],
    templateUrl: "./materials-list.component.html",
    styleUrls: ["./materials-list.component.scss"],
})
export class MaterialListComponent {
    @Input() materials: IMaterial[] = [];
    @Output() callModalAction = new EventEmitter<IMaterial>();
    @Output() callDeleteAction = new EventEmitter<IMaterial>();

    deleteMaterial: IMaterial | null = null;
    searchText: string = "";

    @ViewChild("confirmDeleteModal") confirmDeleteModal!: ConfirmModalComponent;

    get filteredMaterials(): IMaterial[] {
        if (!this.searchText) return this.materials;
        const lower = this.searchText.toLowerCase();
        return this.materials.filter((m) =>
            m.name?.toLowerCase().includes(lower)
        );
    }

    openConfirmationModal(material: IMaterial): void {
        this.deleteMaterial = material;
        this.confirmDeleteModal.show();
    }

    deleteConfirmation(): void {
        if (this.deleteMaterial) {
            this.callDeleteAction.emit(this.deleteMaterial);
            this.deleteMaterial = null;
        }
    }

    trackById(index: number, item: IMaterial) {
        return item.id;
    }

    getFileIcon(fileUrl: string): string {
        const fileExtension = fileUrl.split('.').pop()?.toLowerCase();
        switch (fileExtension) {
            case 'pdf':
                return 'fas fa-file-pdf';
            case 'doc':
            case 'docx':
                return 'fas fa-file-word';
            case 'xls':
            case 'xlsx':
                return 'fas fa-file-excel';
            case 'ppt':
            case 'pptx':
                return 'fas fa-file-powerpoint';
            case 'txt':
                return 'fas fa-file-alt';
            case 'zip':
            case 'rar':
                return 'fas fa-file-archive';
            default:
                return 'fas fa-file';
        }
    }
}