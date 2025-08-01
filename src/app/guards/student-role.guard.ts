import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { IRoleType } from '../interfaces';

export const StudentRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const hasStudentRole = user.authorities?.some(authority =>
    authority.authority === IRoleType.student
  );

  if (!hasStudentRole) {
    router.navigate(['/access-denied']);
    return false;
  }

  return true;
};
