import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/auth/login/login.component";
import { AppLayoutComponent } from "./components/app-layout/app-layout.component";
import { UsersComponent } from "./pages/users/users.component";
import { AuthGuard } from "./guards/auth.guard";
import { AccessDeniedComponent } from "./pages/access-denied/access-denied.component";
import { AdminRoleGuard } from "./guards/admin-role.guard";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { GuestGuard } from "./guards/guest.guard";
import { IRoleType } from "./interfaces";
import { ProfileComponent } from "./pages/profile/profile.component";
import { TeachersComponent } from "./pages/teachers/teachers.component";
import { SchoolsComponent } from "./pages/schools/schools.component";
import { LandingPageComponent } from "./pages/landing-page/landing-page.component";
import { PasswordRecoveryComponent } from "./pages/auth/password-recovery/password-recovery.component";
import { PasswordChangeComponent } from "./pages/auth/password-change/password-change.component";
import { StudentsComponent } from "./pages/students/students.component";
import { PasswordChangeGuard } from "./guards/password-change.guard";
import { BadgesComponent } from "./pages/badges/badges.component";
import { CoursesComponent } from "./pages/courses/courses.component";
import { GroupsComponent } from "./pages/groups/groups.component";
import { AdminTeacherRoleGuard } from "./guards/admin-teacher-role.guard";
import { StudentRoleGuard } from "./guards/student-role.guard";
import { StoriesComponent } from "./pages/stories/stories.component";
import { GroupStudentsComponent } from "./pages/groupstudents/students.component";
import { AssignmentsComponent } from "./pages/assignments/assignments.component";
import { QuizzesComponent } from "./pages/quizzes/quizzes.component";
import { TeamPageComponent } from "./pages/team-page/team-page.component";
import { ProductComponent } from "./pages/product/product.component";
import { ExploreMoreComponent } from "./pages/explore-more/explore-more.component";
import { StudentGroupsComponent } from "./pages/student-groups/student-groups.component";
import { GroupStoriesComponent } from "./pages/group-stories/group-stories.component";
import { QuizComponent } from "./pages/quiz/quiz.component";
import { ChatComponent } from "./pages/chat/chat.component";
import { MaterialsComponent } from "./pages/materials/materials.component";
import { MaterialsReadOnlyComponent } from "./pages/materials-readonly/materials-readonly.component";

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "password-recovery",
    component: PasswordRecoveryComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "access-denied",
    component: AccessDeniedComponent,
  },
  {
    path: "",
    redirectTo: "",
    pathMatch: "full",
  },
  {
    path: "",
    component: LandingPageComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "password-change",
    component: PasswordChangeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "landing",
    component: TeamPageComponent,
  },
  {
    path: "product",
    component: ProductComponent,
  },
  {
    path: "app",
    component: AppLayoutComponent,
    canActivate: [AuthGuard, PasswordChangeGuard],
    children: [
      {
        path: "app",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        component: DashboardComponent,
        data: {
          authorities: [
            IRoleType.superAdmin,
            IRoleType.teacher,
            IRoleType.student,
          ],
          name: "Inicio",
          showInSidebar: true,
        },
      },
      {
        path: "users",
        component: UsersComponent,
        canActivate: [AdminRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin],
          name: "Usuarios",
          showInSidebar: true,
        },
      },
      {
        path: "profile",
        component: ProfileComponent,
        data: {
          authorities: [
            IRoleType.superAdmin,
            IRoleType.teacher,
            IRoleType.student,
          ],
          name: "Perfil",
          showInSidebar: false,
        },
      },
      {
        path: "schools",
        component: SchoolsComponent,
        canActivate: [AdminRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin],
          name: "Escuelas",
          showInSidebar: true,
        },
      },
      {
        path: "teachers",
        component: TeachersComponent,
        canActivate: [AdminRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin],
          name: "Docentes",
          showInSidebar: false,
        },
      },
      {
        path: "students",
        component: StudentsComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Estudiantes",
          showInSidebar: true,
        },
      },
      {
        path: "badges",
        component: BadgesComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Medallas",
          showInSidebar: true,
        },
      },
      {
        path: "courses",
        component: CoursesComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Cursos",
          showInSidebar: true,
        },
      },
      {
        path: "groups",
        component: GroupsComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Grupos",
          showInSidebar: true,
        },
      },
      {
        path: "group-students",
        component: GroupStudentsComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Grupos de Estudiantes",
          showInSidebar: false,
        },
      },
      {
        path: "stories",
        component: StoriesComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Historias",
          showInSidebar: false,
        },
      },
      {
        path: "assignments",
        component: AssignmentsComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Asignaciones",
        },
      },

      {
        path: "quizzes",
        component: QuizzesComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Quices",
        },
      },
      {
        path: "student-groups",
        component: StudentGroupsComponent,
        canActivate: [StudentRoleGuard],
        data: {
          authorities: [IRoleType.student],
          name: "Mis Grupos",
          showInSidebar: true,
        },
      },
      {
        path: "group-by-student-id/:groupId/courses",
        component: GroupStoriesComponent,
        canActivate: [StudentRoleGuard],
        data: {
          authorities: [IRoleType.student],
          name: "Historias del Grupo",
        },
      },
      {
        path: "story/:storyId/quiz",
        component: QuizComponent,
        canActivate: [StudentRoleGuard],
        data: {
          authorities: [IRoleType.student],
          name: "Quiz",
          showInSidebar: false,
        },
      },
      {
        path: "chat",
        component: ChatComponent,
        data: {
          authorities: [
            IRoleType.student,
            IRoleType.teacher,
            IRoleType.superAdmin,
          ],
          name: "Chat",
          showInSidebar: false,
        },
      },
      {
        path: "materials",
        component: MaterialsComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Materiales",
          showInSidebar: false,
        },
      },
      {
        path: "materials-readonly",
        component: MaterialsReadOnlyComponent,
        canActivate: [StudentRoleGuard],
        data: {
          authorities: [IRoleType.student],
          name: "Materiales",
          showInSidebar: false,
        },
      },
      {
        path: "explore-more",
        component: ExploreMoreComponent,
        data: {
          authorities: [
            IRoleType.superAdmin,
            IRoleType.teacher,
            IRoleType.student,
          ],
          name: "Explora +",
          showInSidebar: true,
        },
      },
    ],
  },
];
