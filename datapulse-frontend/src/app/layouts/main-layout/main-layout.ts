import { Component, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout {
  auth = inject(AuthService);

  cart = inject(CartService);

  userName = this.auth.userName;
  role = this.auth.role;

  isAdmin = computed(() => this.auth.isRole('ADMIN'));
  isCorporate = computed(() => this.auth.isRole('CORPORATE'));
  isIndividual = computed(() => this.auth.isRole('INDIVIDUAL'));

  logout() {
    this.auth.logout();
  }
}
