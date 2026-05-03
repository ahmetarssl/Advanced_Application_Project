import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile {
  auth = inject(AuthService);

  user = {
    name: this.auth.userName(),
    email: this.auth.currentUser()?.email ?? '',
    role: this.auth.role() ?? 'INDIVIDUAL',
    phone: '+1 (555) 123-4567',
    city: 'New York',
    bio: 'DataPulse platform user.'
  };

  passwords = { current: '', newPass: '', confirm: '' };
  saveSuccess = false;
  pwSuccess = false;
  pwError = '';

  onSaveProfile() {
    this.saveSuccess = true;
    setTimeout(() => this.saveSuccess = false, 3000);
  }

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
    this.pwSuccess = true;
    this.passwords = { current: '', newPass: '', confirm: '' };
    setTimeout(() => this.pwSuccess = false, 3000);
  }

  getInitials(): string {
    return this.user.name.charAt(0).toUpperCase();
  }
}
