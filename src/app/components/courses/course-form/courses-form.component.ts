import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ICourse} from '../../../interfaces';
import {AuthService} from '../../../services/auth.service';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-courses-form',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule
    ],
    templateUrl: './courses-form.component.html',
    styleUrl: './courses-form.component.scss'
})
export class CoursesFormComponent {
    public fb: FormBuilder = inject(FormBuilder);
    @Input() form!: FormGroup;
    @Output() callSaveMethod: EventEmitter<ICourse> = new EventEmitter<ICourse>();
    @Output() callUpdateMethod: EventEmitter<ICourse> = new EventEmitter<ICourse>();

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

        let item: ICourse = {
            code: this.form.controls["code"].value,
            title: this.form.controls["title"].value,
            description: this.form.controls["description"].value
        };

        if (this.form.controls['id'].value) {
            item.id = this.form.controls['id'].value;
        }

        if (item.id) {
            this.callUpdateMethod.emit(item);
        } else {
            this.callSaveMethod.emit(item);
        }
    }
}
