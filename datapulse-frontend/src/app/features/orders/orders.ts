import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

interface Order {
  id: string;
  customer: string;
  initials: string;
  products: number;
  total: string;
  date: string;
  status: 'Completed' | 'Shipped' | 'Pending' | 'Cancelled';
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class Orders implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  isCorporateOrAdmin = computed(() => this.auth.isRole('ADMIN', 'CORPORATE'));

  filterStatus = 'All Status';
  filterTime = 'All Time';
  searchTerm = '';

  statuses = ['All Status', 'Completed', 'Shipped', 'Pending', 'Cancelled'];

  allOrders: Order[] = [
    { id: '#ORD-7821', customer: 'Sarah Miller',   initials: 'SM', products: 3, total: '$284.00', date: 'Dec 2, 2024', status: 'Completed' },
    { id: '#ORD-7820', customer: 'James Wilson',   initials: 'JW', products: 2, total: '$156.50', date: 'Dec 2, 2024', status: 'Shipped' },
    { id: '#ORD-7819', customer: 'Emily Johnson',  initials: 'EJ', products: 5, total: '$432.00', date: 'Dec 1, 2024', status: 'Pending' },
    { id: '#ORD-7818', customer: 'Mike Brown',     initials: 'MB', products: 1, total: '$89.99',  date: 'Dec 1, 2024', status: 'Cancelled' },
    { id: '#ORD-7817', customer: 'Anna Davis',     initials: 'AD', products: 4, total: '$315.20', date: 'Nov 30, 2024', status: 'Completed' },
    { id: '#ORD-7816', customer: 'Chris Lee',      initials: 'CL', products: 2, total: '$199.00', date: 'Nov 30, 2024', status: 'Shipped' },
    { id: '#ORD-7815', customer: 'Lisa Martinez',  initials: 'LM', products: 3, total: '$267.80', date: 'Nov 29, 2024', status: 'Completed' },
    { id: '#ORD-7814', customer: 'Tom Anderson',   initials: 'TA', products: 1, total: '$45.00',  date: 'Nov 29, 2024', status: 'Pending' },
  ];

  get filteredOrders(): Order[] {
    return this.allOrders.filter(o => {
      const matchStatus = this.filterStatus === 'All Status' || o.status === this.filterStatus;
      const matchSearch = !this.searchTerm || o.customer.toLowerCase().includes(this.searchTerm.toLowerCase()) || o.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/orders`).subscribe({
      next: (data) => { if (data?.content) this.allOrders = data.content; },
      error: () => {}
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
