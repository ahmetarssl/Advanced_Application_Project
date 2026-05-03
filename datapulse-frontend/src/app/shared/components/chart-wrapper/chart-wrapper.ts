import { Component, ElementRef, Input, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import Chart, { ChartType, ChartData } from 'chart.js/auto';

@Component({
  selector: 'app-chart-wrapper',
  standalone: true,
  template: `<div class="canvas-container"><canvas #chartCanvas></canvas></div>`,
  styles: [`
    .canvas-container {
      position: relative;
      height: 100%;
      width: 100%;
      min-height: 250px;
    }
  `]
})
export class ChartWrapper implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  // Dışarıdan gelecek veriler
  @Input() type: ChartType = 'bar';
  @Input() data!: ChartData;

  private chartInstance: Chart | null = null;

  ngAfterViewInit() {
    this.renderChart();
  }

  // Component ekrandan silindiğinde hafızayı (memory) temizle
  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  private renderChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy(); // Eski grafiği ez
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartInstance = new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#1A2A3A', font: { family: 'Segoe UI' } }
          }
        },
        scales: {
          y: {
            ticks: { color: '#8C98A4' },
            grid: { color: '#E2DED0' }
          },
          x: {
            ticks: { color: '#8C98A4' },
            grid: { display: false }
          }
        }
      }
    });
  }
}
