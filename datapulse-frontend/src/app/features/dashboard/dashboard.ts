import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChartWrapper } from '../../shared/components/chart-wrapper/chart-wrapper';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { ChartData } from 'chart.js';

interface KPI {
  title: string;
  value: string | number;
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
  private cdr = inject(ChangeDetectorRef)

  kpiData: KPI[] = [];
  revenueChartData: ChartData | null = null;
  categoryChartData: ChartData | null = null;
  isLoading = true;

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.isLoading = true;

    // Rol kontrolünü backend'e bıraktık. Spring Boot, isteği atan kullanıcının
    // rolünü JWT token'ından okuyup ona uygun verileri dönecek.
    this.http.get<any>(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (data) => {

        // 1. Üstteki 4'lü Kart (KPI) Verilerini Yükle
        if (data?.kpis) {
          this.kpiData = data.kpis;

        }

        // 2. Gelir (Revenue) Grafiği Verilerini Yükle
        // Backend'den data.revenue.labels = ['Mon', 'Tue'...] ve data.revenue.data = [4200, 3800...] gelmeli
        if (data?.revenue) {
          this.revenueChartData = {
            labels: data.revenue.labels || [],
            datasets: [{
              label: 'Revenue ($)',
              data: data.revenue.data || [],
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99,102,241,0.12)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#6366f1',
              pointRadius: 4
            }]
          };
        }

        // 3. Kategori Dağılım Grafiği Verilerini Yükle
        if (data?.categories) {
          this.categoryChartData = {
            labels: data.categories.labels || [],
            datasets: [{
              data: data.categories.data || [],
              backgroundColor: ['#6366f1', '#20c997', '#ffc107', '#f43f5e', '#fd7e14'],
              borderWidth: 0
            }]
          };
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard verileri çekilirken hata:', err);
        this.isLoading = false;
      }
    });
  }
}
