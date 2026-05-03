import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(this.loadUser());

  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);
  readonly userName = computed(() => this._user()?.name ?? this._user()?.email ?? 'User');

  constructor(private router: Router) {}

  private loadUser(): User | null {
    const token = localStorage.getItem('access');
    if (!token) return null;
    return this.decodeUser(token);
  }

  private decodeUser(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const rawRole: string = payload.role ?? payload.authorities?.[0]?.authority ?? 'INDIVIDUAL';
      const role = rawRole.replace('ROLE_', '') as UserRole;
      return {
        email: payload.sub ?? payload.email ?? '',
        name: payload.name ?? payload.sub ?? '',
        role
      };
    } catch {
      return null;
    }
  }

  setToken(token: string, extraInfo?: { name?: string; role?: string }): void {
    localStorage.setItem('access', token);
    const decoded = this.decodeUser(token);
    if (decoded) {
      if (extraInfo?.name) decoded.name = extraInfo.name;
      if (extraInfo?.role) decoded.role = (extraInfo.role.replace('ROLE_', '')) as UserRole;
      this._user.set(decoded);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access');
  }

  logout(): void {
    localStorage.clear();
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  isRole(...roles: UserRole[]): boolean {
    const current = this._user()?.role;
    return current ? roles.includes(current) : false;
  }
}
