import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {IBadge} from '../../../interfaces';

const MAX_BADGE_IMAGE_SIZE = 10 * 1024 * 1024.

@Component({
    selector: 'app-badge-form',
    templateUrl: './badge-form.component.html',
    standalone: true,
    imports: [ReactiveFormsModule],
    styleUrls: ['./badge-form.component.scss']
})
export class BadgeFormComponent {
    @Input() form!: FormGroup;
    @Input() isEditMode = false;

    @Output() callSaveMethod = new EventEmitter<IBadge>();

    submitForm() {
        if (this.form.valid) {
            this.callSaveMethod.emit(this.form.value);
        } else {
            this.form.markAllAsTouched();
        }
    }

    openUploadWidget(): void {
        const widget = (window as any).cloudinary.createUploadWidget(
            {
                cloudName: 'dghnoosr7',
                uploadPreset: 'EduSmart',
                sources: ['local', 'url', 'camera'],
                multiple: false,
                resourceType: 'image',
                clientAllowedFormats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'bmp'],
                maxFileSize: MAX_BADGE_IMAGE_SIZE,
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
                    if (url && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url)) {
                        this.form.controls['iconUrl'].setValue(url);
                    } else {
                        alert('Solo se permiten archivos de imagen válidos (jpg, png, gif, etc).');
                    }
                }
            }
        );
        widget.open();
    }

}
