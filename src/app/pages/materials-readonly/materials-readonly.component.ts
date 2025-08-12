import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CommonModule, Location} from '@angular/common';
import {MaterialService} from '../../services/material.service';
import {IMaterial} from '../../interfaces';
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-materials-readonly',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './materials-readonly.component.html',
    styleUrls: ['./materials-readonly.component.scss']
})
export class MaterialsReadOnlyComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private materialService = inject(MaterialService);
    private location = inject(Location);
    public materials = this.materialService.materials$;
    public searchText = '';
    private courseId: number | null = null;

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            const id = Number(params['courseId']);
            if (id) {
                this.courseId = id;
                this.materialService.setCurrentCourseId(id);
                this.materialService.getByCourse(id);
            }
        });
    }

    goBack() {
        this.location.back();
    }

    filteredMaterials(): IMaterial[] {
        if (!this.searchText) return this.materials();

        const lower = this.searchText.toLowerCase();

        return this.materials().filter(material =>
            material.name?.toLowerCase().includes(lower) ||
            material.teacher?.name?.toLowerCase().includes(lower) ||
            material.fileUrl?.toLowerCase().includes(lower) ||
            this.getFileExtension(material.fileUrl)?.includes(lower) ||
            (material.uploadedAt && new Date(material.uploadedAt).toLocaleDateString('es-ES').includes(lower))
        );
    }

    getFileIcon(fileUrl: string): string {
        const ext = this.getFileExtension(fileUrl);
        switch (ext) {
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

    getFileColorClass(fileUrl: string): string {
        const ext = this.getFileExtension(fileUrl);
        switch (ext) {
            case 'pdf':
                return 'color-pdf';
            case 'doc':
            case 'docx':
                return 'color-word';
            case 'xls':
            case 'xlsx':
                return 'color-excel';
            case 'ppt':
            case 'pptx':
                return 'color-powerpoint';
            default:
                return 'color-default';
        }
    }

    private getFileExtension(fileUrl: string): string | undefined {
        return fileUrl.split('.').pop()?.toLowerCase();
    }
}