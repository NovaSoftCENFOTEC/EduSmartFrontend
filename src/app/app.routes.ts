import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/auth/login/login.component";
import { AppLayoutComponent } from "./components/app-layout/app-layout.component";
import { SigUpComponent } from "./pages/auth/sign-up/signup.component";
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
import { CoursesComponent } from "./pages/courses/courses.component";
import { GroupsComponent } from "./pages/groups/groups.component";
import { StudentsComponent } from "./pages/students/students.component";
import { TeacherRoleGuard } from "./guards/teacher-role.guard";

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "teacher/signup-students",
    component: SigUpComponent,
  },
  {
    path: "access-denied",
    component: AccessDeniedComponent,
  },
  {
    path: "",
    component: LandingPageComponent,
    pathMatch: "full",
  },
  {
    path: "app",
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "app",
        redirectTo: "users",
        pathMatch: "full",
      },
      {
        path: "users",
        component: UsersComponent,
        canActivate: [AdminRoleGuard],
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin],
          name: "Users",
          showInSidebar: true,
        },
      },
      {
        path: "dashboard",
        component: DashboardComponent,
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin, IRoleType.user],
          name: "Dashboard",
          showInSidebar: true,
        },
      },
      {
        path: "profile",
        component: ProfileComponent,
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin, IRoleType.user],
          name: "Profile",
          showInSidebar: false,
        },
      },
      {
        path: "schools",
        component: SchoolsComponent,
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin],
          name: "Schools",
          showInSidebar: true,
        },
      },
      {
        path: "teachers",
        component: TeachersComponent,
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin],
          name: "Teachers",
          showInSidebar: true,
        },
      },
      {
        path: "students",
        component: StudentsComponent,
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin],
          name: "Students",
          showInSidebar: true,
        },
      },
      {
        path: "courses",
        component: CoursesComponent,
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin],
          name: "Courses",
          showInSidebar: true,
        },
      },
      {
        path: "groups",
        component: GroupsComponent,
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin],
          name: "Groups",
          showInSidebar: true,
        },
      },
    ],
  },
];
