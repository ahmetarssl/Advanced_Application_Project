import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  email = '';
  password = '';
  roleType = 'INDIVIDUAL';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  private http = inject(HttpClient);
  private router = inject(Router);

  onRegister() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post(`${environment.apiUrl}/auth/register`, {
      email: this.email,
      password: this.password,
      role: this.roleType
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? 'Kayıt başarısız! E-posta kullanımda olabilir.';
      }
    });
  }
}
