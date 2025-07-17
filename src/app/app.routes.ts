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
import { TeacherRoleGuard } from "./guards/teacher-role.guard";

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
          authorities: [IRoleType.superAdmin],
          name: "Users",
        },
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
          name: "Dashboard",
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
          name: "Profile",
        },
      },
      {
        path: "schools",
        component: SchoolsComponent,
        canActivate: [AdminRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin],
          name: "Schools",
        },
      },
      {
        path: "teachers",
        component: TeachersComponent,
        canActivate: [AdminRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin],
          name: "Teachers",
        },
      },
      {
        path: "students",
        component: StudentsComponent,
        canActivate: [AdminRoleGuard, TeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Students",
        },
      },
    ],
  },
];
