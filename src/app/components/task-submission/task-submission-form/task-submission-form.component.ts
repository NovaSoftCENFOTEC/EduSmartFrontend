import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {FormBuilder, FormGroup, ReactiveFormsModule,} from "@angular/forms";
import {CommonModule, NgIf} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {IAssignment, ITaskSubmission} from "../../../interfaces";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

@Component({
    selector: "app-task-submission-form",
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, NgIf],
    templateUrl: "./task-submission-form.component.html",
    styleUrls: ["./task-submission-form.component.scss"],
})
export class TaskSubmissionFormComponent {
    public fb: FormBuilder = inject(FormBuilder);
    @Input() form!: FormGroup;
    @Input() assignments: IAssignment[] = [];
    @Output() callSaveMethod: EventEmitter<ITaskSubmission> =
        new EventEmitter<ITaskSubmission>();
    @Output() callUpdateMethod: EventEmitter<ITaskSubmission> =
        new EventEmitter<ITaskSubmission>();

    public authService: AuthService = inject(AuthService);
    public route: ActivatedRoute = inject(ActivatedRoute);
    public areActionsAvailable: boolean = false;

    ngOnInit(): void {
        this.authService.getUserAuthorities();
        this.route.data.subscribe((data) => {
            this.areActionsAvailable = this.authService.areActionsAvailable(
                data["authorities"] ?? []
            );
        });
    }


    callSave() {
        if (this.form.invalid) return;
        const student = this.authService.getUser();
        const studentId = student?.id;

        const assignmentId = this.form.controls["assignmentId"].value;

        const item: ITaskSubmission = {
            fileUrl: this.form.controls["fileUrl"].value,
            comment: this.form.controls["comment"].value,
            submittedAt: new Date().toISOString(),
            studentId: studentId!,
            assignmentId: assignmentId
        };

        this.callSaveMethod.emit(item);
    }

    callUpdate() {
        if (this.form.invalid) return;
        const item: ITaskSubmission = {
            id: Number(this.form.controls["id"].value),
            fileUrl: this.form.controls["fileUrl"].value,
            comment: this.form.controls["comment"].value,
            submittedAt: new Date().toISOString(),
            studentId: Number(this.form.controls["studentId"].value),
            assignmentId: Number(this.form.controls["assignmentId"].value)
        };

        this.callUpdateMethod.emit(item);
    }

    openUploadWidget(): void {
        const widget = (window as any).cloudinary.createUploadWidget(
            {
                cloudName: "dghnoosr7",
                uploadPreset: "EduSmart",
                sources: ["local", "url"],
                multiple: false,
                resourceType: "raw",
                clientAllowedFormats: ["pdf", "doc", "docx", "xlsx", "pptx", "txt"],
                maxFileSize: MAX_FILE_SIZE,
                styles: {
                    palette: {
                        window: "#ffffff",
                        windowBorder: "#90A0B3",
                        tabIcon: "#003E6B",
                        menuIcons: "#5A616A",
                        textDark: "#000000",
                        textLight: "#FFFFFF",
                        link: "#1E8B9B",
                        action: "#003E6B",
                        inactiveTabIcon: "#69778A",
                        error: "#A83A15",
                        inProgress: "#003E6B",
                        complete: "#20B832",
                        progressBar: "#1E8B9B",
                    },
                    fonts: {
                        default: null,
                        "'Roboto', sans-serif": {
                            url: "https://fonts.googleapis.com/css?family=Roboto",
                            active: true,
                        },
                    },
                },
            },
            (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    const url = result.info.secure_url;
                    if (url) {
                        this.form.controls["fileUrl"].setValue(url);
                    }
                }
            }
        );
        widget.open();
    }
}
