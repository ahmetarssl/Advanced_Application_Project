import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  private http = inject(HttpClient);
  private router = inject(Router);

  onLogin() {
    // Backend'in bizden beklediği adrese (api/auth/login) POST isteği atıyoruz
    this.http.post('http://localhost:8080/api/auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        // Giriş başarılıysa token'ı kaydet ve dashboard'a yönlendir
        localStorage.setItem('access', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Giriş başarısız! E-posta veya şifre hatalı.';
        console.error(err);
      }
    });
  }
}
