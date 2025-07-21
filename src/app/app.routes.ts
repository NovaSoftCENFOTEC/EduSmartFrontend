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
import { PasswordChangeGuard } from "./guards/password-change.guard";

import { BadgesComponent } from "./pages/badges/badges.component";
import { CoursesComponent } from "./pages/courses/courses.component";
import { GroupsComponent } from "./pages/groups/groups.component";
import { AdminTeacherRoleGuard } from "./guards/admin-teacher-role.guard";
import { StoriesComponent } from "./pages/stories/stories.component";
import { GroupStudentsComponent } from "./pages/groupstudents/students.component";
import { AssignmentsComponent } from "./pages/assignments/assignments.component";

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
    canActivate: [AuthGuard, PasswordChangeGuard],
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
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Students",
        },
      },
      {
        path: "badges",
        component: BadgesComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Badges",
        },
      },
      {
        path: "courses",
        component: CoursesComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Courses",
        },
      },
      {
        path: "groups",
        component: GroupsComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Groups",
        },
      },
      {
        path: "group-students",
        component: GroupStudentsComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Students",
        },
      },
      {
        path: "stories",
        component: StoriesComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Stories",
        },
        
      },
      {
        path: "assignments",
        component: AssignmentsComponent,
        canActivate: [AdminTeacherRoleGuard],
        data: {
          authorities: [IRoleType.superAdmin, IRoleType.teacher],
          name: "Assignments",
        },
        
      },
    ],
  },
];
