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
import {TeachersComponent} from "./pages/teachers/teachers.component";
import {SchoolsComponent} from "./pages/schools/schools.component";

import { LandingPageComponent } from "./pages/landing-page/landing-page.component";
import { CoursesComponent } from "./pages/courses/courses.component";

// Existing protected routes (commented out)
// export const routes: Routes = [
//   {
//     path: "login",
//     component: LoginComponent,
//     canActivate: [GuestGuard],
//   },
//   {
//     path: "signup",
//     component: SigUpComponent,
//     canActivate: [GuestGuard],
//   },
//   {
//     path: "access-denied",
//     component: AccessDeniedComponent,
//   },
//   {
//     path: "",
//     redirectTo: "login",
//     pathMatch: "full",
//   },
//   {
//     path: "app",
//     component: AppLayoutComponent,
//     canActivate: [AuthGuard],
//     children: [
//       {
//         path: "app",
//         redirectTo: "users",
//         pathMatch: "full",
//       },
//       {
//         path: "users",
//         component: UsersComponent,
//         canActivate: [AdminRoleGuard],
//         data: {
//           authorities: [IRoleType.admin, IRoleType.superAdmin],
//           name: "Users",
//           showInSidebar: true,
//         },
//       },
//       {
//         path: "dashboard",
//         component: DashboardComponent,
//         data: {
//           authorities: [IRoleType.admin, IRoleType.superAdmin, IRoleType.user],
//           name: "Dashboard",
//           showInSidebar: true,
//         },
//       },
//       {
//         path: "profile",
//         component: ProfileComponent,
//         data: {
//           authorities: [IRoleType.admin, IRoleType.superAdmin, IRoleType.user],
//           name: "profile",
//           showInSidebar: false,
//         },
//       },
//     ],
//   },
// ];

// Unprotected routes (all pages accessible without guards)
export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "teacher/signup-student",
    component: SigUpComponent,
  },
  //signup student
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
  },
  {
    path: "app",
    component: AppLayoutComponent,
    children: [
      {
        path: "app",
        redirectTo: "users",
        pathMatch: "full",
      },
      {
        path: "users",
        component: UsersComponent,
      },
      {
        path: "dashboard",
        component: DashboardComponent,
      },
      {
        path: "profile",
        component: ProfileComponent,
      },
      {
        path: "schools",
        component: SchoolsComponent,
      }
        ,
        {
          path: "teachers",
          component: TeachersComponent,
        },

         {
          path: "courses",
          component: CoursesComponent,
          data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin],
          name: "Dashboard",
          showInSidebar: true,
         },
         }
    ],
  },
];
