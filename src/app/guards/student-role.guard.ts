import {inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot,} from "@angular/router";
import {AuthService} from "../services/auth.service";
import {IRoleType} from "../interfaces";

@Injectable({
    providedIn: "root",
})
export class StudentRoleGuard implements CanActivate {
    private authService = inject(AuthService);
    private router = inject(Router);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const hasRole = this.authService.hasRole(IRoleType.student);

        if (!hasRole) {
            this.router.navigate(["access-denied"]);
            return false;
        }
        return true;
    }
}
