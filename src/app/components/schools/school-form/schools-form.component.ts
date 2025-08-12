import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ISchool} from '../../../interfaces';
import {AuthService} from '../../../services/auth.service';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-schools-form',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule
    ],
    templateUrl: './schools-form.component.html',
    styleUrl: './schools-form.component.scss'
})
export class SchoolsFormComponent {
    public fb: FormBuilder = inject(FormBuilder);
    @Input() form!: FormGroup;
    @Output() callSaveMethod: EventEmitter<ISchool> = new EventEmitter<ISchool>();
    @Output() callUpdateMethod: EventEmitter<ISchool> = new EventEmitter<ISchool>();

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

        let item: ISchool = {
            name: this.form.controls["name"].value,
            domain: this.form.controls["domain"].value
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
