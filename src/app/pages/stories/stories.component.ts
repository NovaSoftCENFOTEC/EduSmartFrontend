import {
  Component,
  inject,
  OnInit,
  ViewChild,
  WritableSignal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { ModalComponent } from "../../components/modal/modal.component";
import { IStory } from "../../interfaces";
import { FormBuilder, Validators } from "@angular/forms";
import { ModalService } from "../../services/modal.service";
import { AuthService } from "../../services/auth.service";
import { ActivatedRoute } from "@angular/router";
import { FooterComponent } from "../../components/app-layout/elements/footer/footer.component";
import { StoryService } from "../../services/story.service";

import { StoriesFormComponent } from "../../components/stories/story-form/stories-form.component";
import { StoryListComponent } from "../../components/stories/story-list/stories-list.component";

@Component({
  selector: "app-stories",
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    ModalComponent,
    StoryListComponent,
    StoriesFormComponent,
    FooterComponent,
  ],
  templateUrl: "./stories.component.html",
  styleUrls: ["./stories.component.scss"],
})
export class StoriesComponent implements OnInit {
  public storyList!: WritableSignal<IStory[]>;
  public storyService: StoryService = inject(StoryService);
  public fb: FormBuilder = inject(FormBuilder);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  public route: ActivatedRoute = inject(ActivatedRoute);

  @ViewChild("editStoryModal") public editStoryModal: any;
  @ViewChild("addStoryModal") public addStoryModal: any;
  @ViewChild("editConfirmationModal") public editConfirmationModal: any;

  public areActionsAvailable: boolean = false;
  private courseId: number | null = null;
  private originalStory: IStory | null = null;
  private pendingEditItem: IStory | null = null;
  public isLoading: boolean = false;

  storyForm = this.fb.group({
    id: [""],
    title: ["", Validators.required],
    content: ["", Validators.required],
    createdAt: [""],
  });

  constructor() {
    this.storyList = this.storyService.stories$;
  }

  ngOnInit(): void {
    this.authService.getUserAuthorities();

    this.route.queryParams.subscribe((params) => {
      const id = Number(params["courseId"]);
      if (id) {
        this.courseId = id;
        sessionStorage.setItem("courseId", id.toString());
      } else {
        const storedId = sessionStorage.getItem("courseId");
        this.courseId = storedId ? Number(storedId) : null;
      }
      this.storyList = this.storyService.stories$;
      this.loadStories();
    });

    this.route.data.subscribe((data) => {
      this.areActionsAvailable = this.authService.areActionsAvailable(
        data["authorities"] ?? []
      );
    });
  }

  loadStories(): void {
    if (this.courseId) {
      this.storyService.getStoriesByCourse(this.courseId);
    }
  }

  handleAddStory(item: IStory) {
    if (!this.courseId) return;
    this.isLoading = true;
    this.storyService.saveStory(this.courseId, item, () => {
      this.modalService.closeAll();
      this.storyForm.reset();
      this.loadStories();
      this.isLoading = false;
    });
  }

  updateStory() {
    if (!this.originalStory) return;

    const payloadToSend: Partial<IStory> = {
      id: this.originalStory.id,
      title: this.storyForm.controls["title"].value || "",
      content: this.storyForm.controls["content"].value || "",
    };

    this.isLoading = true;
    this.storyService.updateStory(payloadToSend as IStory, () => {
      this.modalService.closeAll();
      this.storyForm.reset();
      this.originalStory = null;
      this.storyService.getStoriesByCourse(this.courseId!);
      this.isLoading = false;
    });
  }

  deleteStory(item: IStory) {
    if (!this.courseId || !item.id) return;
    this.storyService.deleteStory(item, () => {
      this.storyService.getStoriesByCourse(this.courseId!);
    });
  }

  openEditStoryModal(story: IStory) {
    this.originalStory = story;
    this.storyForm.patchValue({
      id: JSON.stringify(story.id),
      title: story.title,
      content: story.content,
      createdAt: story.createdAt ? new Date(story.createdAt).toISOString() : "",
    });
    this.modalService.displayModal("lg", this.editStoryModal);
  }

  openAddStoryModal() {
    this.storyForm.reset();
    this.modalService.displayModal("md", this.addStoryModal);
  }

  confirmEdit(item: IStory) {
    this.pendingEditItem = item;
    this.modalService.closeAll();
    this.modalService.displayModal("sm", this.editConfirmationModal);
  }

  cancelEdit() {
    this.pendingEditItem = null;
    this.modalService.closeAll();
    this.modalService.displayModal("lg", this.editStoryModal);
  }

  confirmEditFinal() {
    if (this.pendingEditItem) {
      this.updateStory();
      this.pendingEditItem = null;
    }
  }

  goBack() {
    window.history.back();
  }
}
