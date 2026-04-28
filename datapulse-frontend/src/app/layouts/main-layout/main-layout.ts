import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout {
  private router = inject(Router);

  logout() {
    localStorage.removeItem('access');
    this.router.navigate(['/login']);
  }
}
