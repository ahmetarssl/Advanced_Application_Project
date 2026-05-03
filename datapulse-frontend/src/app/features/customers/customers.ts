import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Customer {
  id: number;
  name: string;
  initials: string;
  city: string;
  membership: 'Gold' | 'Silver' | 'Bronze';
  totalSpend: string;
  orders: number;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css']
})
export class Customers implements OnInit {
  private http = inject(HttpClient);

  searchTerm = '';

  summaryCards = [
    { label: 'Total Customers', value: '3,421', change: '+72 this month', icon: 'bi-people', color: 'icon-blue' },
    { label: 'New This Month', value: '284', change: '+38.7%', icon: 'bi-person-plus', color: 'icon-green' },
    { label: 'Gold Members', value: '892', change: '+5.2%', icon: 'bi-award', color: 'icon-yellow' },
    { label: 'Avg. LTV', value: '$142', change: '+15.8%', icon: 'bi-currency-dollar', color: 'icon-orange' },
  ];

  customers: Customer[] = [
    { id: 1, name: 'Sarah Miller',   initials: 'SM', city: 'New York',    membership: 'Gold',   totalSpend: '$1,284.88', orders: 14, status: 'Active' },
    { id: 2, name: 'James Wilson',   initials: 'JW', city: 'Los Angeles', membership: 'Silver', totalSpend: '$756.58',  orders: 8,  status: 'Active' },
    { id: 3, name: 'Emily Johnson',  initials: 'EJ', city: 'Chicago',     membership: 'Bronze', totalSpend: '$432.88',  orders: 5,  status: 'Active' },
    { id: 4, name: 'Mike Brown',     initials: 'MB', city: 'Houston',     membership: 'Silver', totalSpend: '$920.00',  orders: 11, status: 'Inactive' },
    { id: 5, name: 'Anna Davis',     initials: 'AD', city: 'Phoenix',     membership: 'Gold',   totalSpend: '$2,140.00', orders: 22, status: 'Active' },
    { id: 6, name: 'Chris Lee',      initials: 'CL', city: 'San Antonio', membership: 'Bronze', totalSpend: '$310.40',  orders: 4,  status: 'Active' },
  ];

  get filtered(): Customer[] {
    if (!this.searchTerm) return this.customers;
    const t = this.searchTerm.toLowerCase();
    return this.customers.filter(c => c.name.toLowerCase().includes(t) || c.city.toLowerCase().includes(t));
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/customers`).subscribe({
      next: (data) => { if (data?.content) this.customers = data.content; },
      error: () => {}
    });
  }
}
