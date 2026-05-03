import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Store {
  id: number;
  name: string;
  owner: string;
  category: string;
  revenue: string;
  products: number;
  status: 'Open' | 'Closed' | 'Pending';
  joinDate: string;
}

@Component({
  selector: 'app-admin-stores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-stores.html',
  styleUrls: ['./admin-stores.css']
})
export class AdminStores implements OnInit {
  private http = inject(HttpClient);

  searchTerm = '';
  filterStatus = 'All';
  statuses = ['All', 'Open', 'Closed', 'Pending'];

  stores: Store[] = [
    { id: 1, name: 'Fashion Hub',        owner: 'store@fashionhub.com',  category: 'Fashion',     revenue: '$48,294', products: 124, status: 'Open',    joinDate: 'Jan 15, 2024' },
    { id: 2, name: 'TechMart',           owner: 'admin@techmart.com',    category: 'Electronics', revenue: '$92,100', products: 87,  status: 'Open',    joinDate: 'Feb 20, 2024' },
    { id: 3, name: 'Home Essentials',    owner: 'owner@homeess.com',     category: 'Home',        revenue: '$31,500', products: 210, status: 'Open',    joinDate: 'Mar 10, 2024' },
    { id: 4, name: 'Beauty World',       owner: 'beauty@world.com',      category: 'Beauty',      revenue: '$19,800', products: 56,  status: 'Closed',  joinDate: 'Apr 5, 2024'  },
    { id: 5, name: 'Sports Plus',        owner: 'info@sportsplus.com',   category: 'Sports',      revenue: '$0',      products: 0,   status: 'Pending', joinDate: 'Nov 28, 2024' },
  ];

  get filtered(): Store[] {
    return this.stores.filter(s => {
      const matchStatus = this.filterStatus === 'All' || s.status === this.filterStatus;
      const matchSearch = !this.searchTerm || s.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/admin/stores`).subscribe({
      next: (data) => { if (Array.isArray(data)) this.stores = data; },
      error: () => {}
    });
  }

  approveStore(store: Store) { store.status = 'Open'; }
  toggleStore(store: Store) { store.status = store.status === 'Open' ? 'Closed' : 'Open'; }
}
