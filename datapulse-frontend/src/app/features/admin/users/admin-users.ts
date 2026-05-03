import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface AppUser {
  id: number;
  email: string;
  initials: string;
  role: string;
  status: 'Active' | 'Suspended';
  joinDate: string;
  orders: number;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.css']
})
export class AdminUsers implements OnInit {
  private http = inject(HttpClient);

  searchTerm = '';
  filterRole = 'All';
  roles = ['All', 'ADMIN', 'CORPORATE', 'INDIVIDUAL'];

  users: AppUser[] = [
    { id: 1, email: 'admin@datapulse.com',    initials: 'AD', role: 'ADMIN',      status: 'Active',    joinDate: 'Jan 1, 2024',  orders: 0 },
    { id: 2, email: 'store@example.com',       initials: 'ST', role: 'CORPORATE',  status: 'Active',    joinDate: 'Feb 12, 2024', orders: 0 },
    { id: 3, email: 'sarah.m@gmail.com',       initials: 'SM', role: 'INDIVIDUAL', status: 'Active',    joinDate: 'Mar 5, 2024',  orders: 14 },
    { id: 4, email: 'james.w@gmail.com',       initials: 'JW', role: 'INDIVIDUAL', status: 'Active',    joinDate: 'Apr 8, 2024',  orders: 8 },
    { id: 5, email: 'banned@example.com',      initials: 'BU', role: 'INDIVIDUAL', status: 'Suspended', joinDate: 'May 20, 2024', orders: 2 },
    { id: 6, email: 'corp2@business.com',      initials: 'C2', role: 'CORPORATE',  status: 'Active',    joinDate: 'Jun 1, 2024',  orders: 0 },
  ];

  showAddModal = false;
  newUser = { email: '', role: 'INDIVIDUAL', password: '' };

  get filtered(): AppUser[] {
    return this.users.filter(u => {
      const matchRole = this.filterRole === 'All' || u.role === this.filterRole;
      const matchSearch = !this.searchTerm || u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchRole && matchSearch;
    });
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (data) => { if (Array.isArray(data)) this.users = data; },
      error: () => {}
    });
  }

  toggleStatus(user: AppUser) {
    user.status = user.status === 'Active' ? 'Suspended' : 'Active';
  }

  deleteUser(id: number) {
    this.users = this.users.filter(u => u.id !== id);
  }

  addUser() {
    this.showAddModal = false;
    this.newUser = { email: '', role: 'INDIVIDUAL', password: '' };
  }
}
