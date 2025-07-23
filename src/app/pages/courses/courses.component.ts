import { Component, ViewChild, inject } from '@angular/core';

import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { ICourse } from '../../interfaces';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { FooterComponent } from '../../components/app-layout/elements/footer/footer.component';
import { CoursesFormComponent } from '../../components/courses/course-form/courses-form.component';
import { CoursesListComponent } from '../../components/courses/course-list/courses-list.component';
import { CourseService } from '../../services/course.service';

@Component({
    selector: 'app-courses',
    standalone: true,
    imports: [
        PaginationComponent,
        ModalComponent,
        CoursesFormComponent,
        CoursesListComponent,
        NgIf,
    ],
    templateUrl: './courses.component.html',
    styleUrl: './courses.component.scss'
})
export class CoursesComponent {
    public courseService: CourseService = inject(CourseService);
    public fb: FormBuilder = inject(FormBuilder);
    public modalService: ModalService = inject(ModalService);
    public authService: AuthService = inject(AuthService);
    public route: ActivatedRoute = inject(ActivatedRoute);

    public courseForm = this.fb.group({
        id: [''],
        code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{3,10}$/)]],
        title: ['', [Validators.required, Validators.maxLength(100)]],
        description: ['', [Validators.required, Validators.maxLength(250)]],
        createdAt: ['']
    });

    @ViewChild('editCourseModal') public editCourseModal: any;
    @ViewChild('addCourseModal') public addCourseModal: any;
    @ViewChild('editConfirmationModal') public editConfirmationModal: any;

    public areActionsAvailable: boolean = false;
    private pendingEditItem: ICourse | null = null;

    constructor() {
    }

    ngOnInit(): void {
        this.authService.getUserAuthorities();
        this.route.data.subscribe(data => {
            this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ?? []);
        });

        this.courseService.getAll();
    }

    saveCourse(item: ICourse) {
        this.courseService.save(item);
    }

    handleAddCourse(item: ICourse) {
        this.saveCourse(item);
        this.modalService.closeAll();
        this.courseForm.reset();
    }

    updateCourse(item: ICourse) {
        this.courseService.update(item);
        this.modalService.closeAll();
        this.courseForm.reset();
    }

    deleteCourse(item: ICourse) {
        this.courseService.delete(item);
    }

    openEditCourseModal(course: ICourse) {
        this.courseForm.patchValue({
            id: JSON.stringify(course.id),
            code: course.code,
            title: course.title,
            description: course.description,
            createdAt: course.createdAt
        });
        this.modalService.displayModal('lg', this.editCourseModal);
    }

    openAddCourseModal() {
        this.courseForm.reset();
        this.modalService.displayModal('md', this.addCourseModal);
    }

    confirmEdit(item: ICourse) {
        this.pendingEditItem = item;
        this.modalService.closeAll();
        this.modalService.displayModal('sm', this.editConfirmationModal);
    }

    cancelEdit() {
        this.pendingEditItem = null;
        this.modalService.closeAll();
        this.modalService.displayModal('lg', this.editCourseModal);
    }

    confirmEditFinal() {
        if (this.pendingEditItem) {
            this.updateCourse(this.pendingEditItem);
            this.pendingEditItem = null;
        }
    }

    goBack() {
        window.history.back();
    }
}
