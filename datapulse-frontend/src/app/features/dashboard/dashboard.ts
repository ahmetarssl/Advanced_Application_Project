import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  // KPI (Özet) Kartları için örnek veriler
  kpiData = [
    { title: 'Total Revenue', value: '$48,294', trend: '+12.5%', isPositive: true, icon: 'bi-currency-dollar', colorClass: 'icon-yellow' },
    { title: 'Total Orders', value: '1,842', trend: '+8.2%', isPositive: true, icon: 'bi-bag', colorClass: 'icon-blue' },
    { title: 'Customers', value: '3,421', trend: '+14.3%', isPositive: true, icon: 'bi-people', colorClass: 'icon-green' },
    { title: 'Avg Rating', value: '4.8', trend: '-0.1%', isPositive: false, icon: 'bi-star', colorClass: 'icon-orange' }
  ];
}
