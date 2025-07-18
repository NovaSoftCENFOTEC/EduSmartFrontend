import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { routes } from '../../app.routes'; // ✅ IMPORTAR las rutas

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  public allowedRoutes: any[] = []; 

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    

    this.filterAllowedRoutes();
  }


  private filterAllowedRoutes(): void {
   
    const appRoute = routes.find(route => route.path === 'app');
    const childRoutes = appRoute?.children || [];

  
    this.allowedRoutes = childRoutes.filter(route => {
  
      if (route.data && route.data['authorities']) {
        const authorities = route.data['authorities'];
        return this.authService.areActionsAvailable(authorities);
      }
      

      if (route.path === 'dashboard' || route.path === 'profile') {
        return true;
      }
      
      return false;
    });

    console.log('📋 Allowed routes:', this.allowedRoutes);
  }

  


}