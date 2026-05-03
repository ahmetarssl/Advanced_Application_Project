import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartWrapper } from '../../shared/components/chart-wrapper/chart-wrapper';
import { ChartData } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartWrapper],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class Analytics implements OnInit {
  selectedRange = '30d';
  ranges = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' },
  ];

  summaryCards = [
    { title: 'Monthly Revenue', value: '$127,540', change: '+16.2%', positive: true, icon: 'bi-currency-dollar', color: 'icon-yellow' },
    { title: 'Conversion Rate', value: '3.2%', change: '+0.4%', positive: true, icon: 'bi-graph-up', color: 'icon-green' },
    { title: 'Avg Order Value', value: '$68.50', change: '+12.7%', positive: true, icon: 'bi-receipt', color: 'icon-blue' },
    { title: 'Return Rate', value: '4.8%', change: '-3.2%', positive: false, icon: 'bi-arrow-return-left', color: 'icon-orange' },
  ];

  salesTrendData: ChartData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{
      label: 'Revenue ($)',
      data: [42000, 58000, 51000, 73000, 89000, 95000, 102000, 98000, 115000, 127000, 108000, 134000],
      borderColor: '#20c997',
      backgroundColor: 'rgba(32,201,151,0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  categoryData: ChartData = {
    labels: ['Fashion', 'Electronics', 'Home & Garden', 'Beauty'],
    datasets: [{
      data: [35, 28, 22, 15],
      backgroundColor: ['#6366f1','#20c997','#ffc107','#f43f5e'],
      borderWidth: 0,
    }]
  };

  topProducts = [
    { name: 'Classic Cotton T-Shirt', category: 'Fashion', revenue: '$18,420', units: 614, growth: '+22%' },
    { name: 'Wireless Headphones', category: 'Electronics', revenue: '$14,850', units: 99, growth: '+18%' },
    { name: 'Smart Watch Series X', category: 'Electronics', revenue: '$12,340', units: 41, growth: '+35%' },
    { name: 'Leather Handbag', category: 'Fashion', revenue: '$10,980', units: 55, growth: '+12%' },
    { name: 'Running Sneakers Pro', category: 'Sports', revenue: '$9,720', units: 108, growth: '+28%' },
  ];

  ngOnInit() {}

  onRangeChange() {}
}
