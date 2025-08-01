import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule, NgIf} from '@angular/common'; 
import {IMaterial} from '../../../interfaces';
import {AuthService} from '../../../services/auth.service';
import {ActivatedRoute} from '@angular/router';


const MAX_MATERIAL_FILE_SIZE = 20 * 1024 * 1024;

@Component({
    selector: 'app-materials-form',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, NgIf],
    templateUrl: './materials-form.component.html',
    styleUrls: ['./materials-form.component.scss']
})
export class MaterialsFormComponent {
    public fb: FormBuilder = inject(FormBuilder);
    @Input() form!: FormGroup;
    @Output() callSaveMethod: EventEmitter<IMaterial> = new EventEmitter<IMaterial>();
    @Output() callUpdateMethod: EventEmitter<IMaterial> = new EventEmitter<IMaterial>();

    public authService: AuthService = inject(AuthService);
    public areActionsAvailable: boolean = false;
    public route: ActivatedRoute = inject(ActivatedRoute);

    ngOnInit(): void {
        this.authService.getUserAuthorities();
        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
        });
    }

    callSave() {
        if (this.form.invalid) return;

        const item: IMaterial = {
            id: this.form.controls['id'].value,
            name: this.form.controls['name'].value,
            fileUrl: this.form.controls['fileUrl'].value
        };

        if (item.id) {
            this.callUpdateMethod.emit({...item, id: Number(item.id)});
        } else {
            this.callSaveMethod.emit(item);
        }
    }

    openUploadWidget(): void {
        const widget = (window as any).cloudinary.createUploadWidget(
            {
                cloudName: 'dghnoosr7',
                uploadPreset: 'EduSmart',
                sources: ['local', 'url'],
                multiple: false,
                resourceType: 'raw',
                clientAllowedFormats: ['pdf', 'doc', 'docx', 'xlsx', 'pptx', 'txt'],
                maxFileSize: MAX_MATERIAL_FILE_SIZE,
                styles: {
                    palette: {
                        window: '#ffffff',
                        windowBorder: '#90A0B3',
                        tabIcon: '#003E6B',
                        menuIcons: '#5A616A',
                        textDark: '#000000',
                        textLight: '#FFFFFF',
                        link: '#1E8B9B',
                        action: '#003E6B',
                        inactiveTabIcon: '#69778A',
                        error: '#A83A15',
                        inProgress: '#003E6B',
                        complete: '#20B832',
                        progressBar: '#1E8B9B'
                    },
                    fonts: {
                        default: null,
                        "'Roboto', sans-serif": {
                            url: 'https://fonts.googleapis.com/css?family=Roboto',
                            active: true
                        }
                    }
                }
            },
            (error: any, result: any) => {
                if (!error && result && result.event === 'success') {
                    const url = result.info.secure_url;
                    if (url) {
                        this.form.controls['fileUrl'].setValue(url);
                    }
                }
            }
        );
        widget.open();
    }
}