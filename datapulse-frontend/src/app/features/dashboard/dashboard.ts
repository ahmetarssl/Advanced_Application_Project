import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChartWrapper } from '../../shared/components/chart-wrapper/chart-wrapper';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { ChartData } from 'chart.js';

interface KPI {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartWrapper],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  kpiData: KPI[] = [];
  revenueChartData: ChartData | null = null;
  categoryChartData: ChartData | null = null;
  isLoading = true;

  private adminKpis: KPI[] = [
    { title: 'Total Platform Revenue', value: '$1,248,590', trend: '+18.2%', isPositive: true, icon: 'bi-currency-dollar', colorClass: 'icon-yellow' },
    { title: 'Total Orders', value: '52,841', trend: '+11.4%', isPositive: true, icon: 'bi-bag', colorClass: 'icon-blue' },
    { title: 'Active Users', value: '14,293', trend: '+22.1%', isPositive: true, icon: 'bi-people', colorClass: 'icon-green' },
    { title: 'Active Stores', value: '234', trend: '+5.3%', isPositive: true, icon: 'bi-shop', colorClass: 'icon-orange' }
  ];

  private corporateKpis: KPI[] = [
    { title: 'Total Revenue', value: '$48,294', trend: '+12.5%', isPositive: true, icon: 'bi-currency-dollar', colorClass: 'icon-yellow' },
    { title: 'Total Orders', value: '1,842', trend: '+8.2%', isPositive: true, icon: 'bi-bag', colorClass: 'icon-blue' },
    { title: 'Customers', value: '3,421', trend: '+14.3%', isPositive: true, icon: 'bi-people', colorClass: 'icon-green' },
    { title: 'Avg Rating', value: '4.8', trend: '-0.1%', isPositive: false, icon: 'bi-star', colorClass: 'icon-orange' }
  ];

  private individualKpis: KPI[] = [
    { title: 'My Orders', value: '24', trend: '+3', isPositive: true, icon: 'bi-bag-check', colorClass: 'icon-blue' },
    { title: 'Total Spent', value: '$1,284', trend: '+$128', isPositive: true, icon: 'bi-currency-dollar', colorClass: 'icon-yellow' },
    { title: 'Pending Orders', value: '2', trend: '0', isPositive: true, icon: 'bi-hourglass-split', colorClass: 'icon-orange' },
    { title: 'Reviews Given', value: '18', trend: '+4', isPositive: true, icon: 'bi-star', colorClass: 'icon-green' }
  ];

  ngOnInit() {
    const role = this.auth.role();
    this.kpiData = role === 'ADMIN' ? this.adminKpis : role === 'CORPORATE' ? this.corporateKpis : this.individualKpis;
    this.loadCharts();
    this.loadFromApi();
  }

  private loadCharts() {
    this.revenueChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Revenue ($)',
        data: [4200, 3800, 5100, 4600, 6200, 8400, 7900],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.12)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4
      }]
    };

    this.categoryChartData = {
      labels: ['Fashion', 'Electronics', 'Home', 'Beauty', 'Sports'],
      datasets: [{
        data: [32, 27, 19, 13, 9],
        backgroundColor: ['#6366f1', '#20c997', '#ffc107', '#f43f5e', '#fd7e14'],
        borderWidth: 0
      }]
    };
  }

  private loadFromApi() {
    this.http.get<any>(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (data) => {
        if (data?.kpis) this.kpiData = data.kpis;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
