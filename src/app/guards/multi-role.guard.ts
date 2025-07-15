import { Injectable, inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { IRoleType } from "../interfaces";

@Injectable({
  providedIn: 'root',
})
export class MultiRoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const hasValidRole =
      this.authService.hasRole(IRoleType.admin) ||
      this.authService.hasRole(IRoleType.superAdmin) ||
      this.authService.hasRole(IRoleType.teacher);

    if (!hasValidRole) {
      this.router.navigate(['access-denied']);
      return false;
    }

    return true;
  }
}