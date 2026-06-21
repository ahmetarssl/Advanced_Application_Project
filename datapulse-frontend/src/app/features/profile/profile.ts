import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  // Başlangıçta token'dan gelen temel bilgileri koyuyoruz,
  // eksik olanları (telefon, şehir, bio) ngOnInit'te backend'den çekeceğiz.
  user = {
    name: this.auth.userName(),
    email: this.auth.currentUser()?.email ?? '',
    role: this.auth.role() ?? 'INDIVIDUAL',
    phone: '',
    city: '',
    bio: ''
  };

  passwords = { current: '', newPass: '', confirm: '' };
  saveSuccess = false;
  pwSuccess = false;
  pwError = '';

  ngOnInit() {
    this.loadUserProfile();
  }

  // 1. Kullanıcının eksik profil bilgilerini veritabanından çekme
  loadUserProfile() {
    this.http.get<any>(`${environment.apiUrl}/profile`).subscribe({
      next: (data) => {
        if (data) {
          // Backend'den gelen verilerle profilimizi güncelliyoruz
          this.user.phone = data.phone || '';
          this.user.city = data.city || '';
          this.user.bio = data.bio || '';
          // Eğer isim veya email güncellenmişse onları da üzerine yazabilirsin
          if(data.name) this.user.name = data.name;
        }
      },
      error: (err) => console.error('Profil bilgileri çekilemedi:', err)
    });
  }

  // 2. Formdaki değişiklikleri veritabanına kaydetme
  onSaveProfile() {
    // Sadece güncellenebilir alanları gönderiyoruz
    const updateData = {
      name: this.user.name,
      phone: this.user.phone,
      city: this.user.city,
      bio: this.user.bio
    };

    this.http.put(`${environment.apiUrl}/profile`, updateData).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (err) => console.error('Profil kaydedilemedi:', err)
    });
  }

  // 3. Şifre değiştirme isteğini backend'e iletme
  onChangePassword() {
    if (this.passwords.newPass !== this.passwords.confirm) {
      this.pwError = 'Passwords do not match.';
      return;
    }
    if (this.passwords.newPass.length < 6) {
      this.pwError = 'Password must be at least 6 characters.';
      return;
    }

    this.pwError = '';

    const passwordData = {
      currentPassword: this.passwords.current,
      newPassword: this.passwords.newPass
    };

    // Backend şifre değişimi için genelde POST veya PATCH bekler
    this.http.post(`${environment.apiUrl}/profile/change-password`, passwordData).subscribe({
      next: () => {
        this.pwSuccess = true;
        this.passwords = { current: '', newPass: '', confirm: '' };
        setTimeout(() => this.pwSuccess = false, 3000);
      },
      error: (err) => {
        // Backend'den "Eski şifre yanlış" gibi bir hata dönerse ekrana basıyoruz
        this.pwError = err.error?.message || 'Şifre değiştirilemedi. Lütfen tekrar deneyin.';
        console.error('Şifre değiştirme hatası:', err);
      }
    });
  }

  getInitials(): string {
    return this.user.name ? this.user.name.charAt(0).toUpperCase() : 'U';
  }
}
