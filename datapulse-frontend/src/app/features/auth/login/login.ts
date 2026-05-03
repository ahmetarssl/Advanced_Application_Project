import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'E-posta ve şifre alanları zorunludur.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.http.post<any>(`${environment.apiUrl}/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.auth.setToken(response.token, {
          name: response.name ?? response.email,
          role: response.role
        });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Giriş başarısız! E-posta veya şifre hatalı.';
      }
    });
  }
}
