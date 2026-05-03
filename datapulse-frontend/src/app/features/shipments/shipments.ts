import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Shipment {
  trackingId: string;
  orderId: string;
  customer: string;
  carrier: string;
  destination: string;
  status: 'In Transit' | 'Processing' | 'Delivered' | 'Returned';
  eta: string;
}

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipments.html',
  styleUrls: ['./shipments.css']
})
export class Shipments implements OnInit {
  private http = inject(HttpClient);

  summaryCards = [
    { label: 'Pending',    value: '156', icon: 'bi-hourglass-split', color: 'icon-yellow' },
    { label: 'In Transit', value: '423', icon: 'bi-truck',           color: 'icon-blue'   },
    { label: 'Delivered',  value: '1,247', icon: 'bi-check-circle', color: 'icon-green'  },
    { label: 'Returns',    value: '23',  icon: 'bi-arrow-return-left', color: 'icon-orange' },
  ];

  filterStatus = 'All';
  statuses = ['All', 'In Transit', 'Processing', 'Delivered', 'Returned'];

  shipments: Shipment[] = [
    { trackingId: 'TRK-892341', orderId: '#7820', customer: 'James Wilson',  carrier: 'FedEx', destination: 'Los Angeles, CA', status: 'In Transit',  eta: 'Dec 4' },
    { trackingId: 'TRK-892340', orderId: '#7819', customer: 'Emily Johnson', carrier: 'UPS',   destination: 'Chicago, IL',     status: 'Processing',  eta: 'Dec 5' },
    { trackingId: 'TRK-892339', orderId: '#7815', customer: 'Michael Lee',   carrier: 'DHL',   destination: 'Miami, FL',       status: 'Delivered',   eta: 'Dec 1' },
    { trackingId: 'TRK-892338', orderId: '#7814', customer: 'Sarah Miller',  carrier: 'FedEx', destination: 'New York, NY',    status: 'In Transit',  eta: 'Dec 4' },
    { trackingId: 'TRK-892337', orderId: '#7810', customer: 'Anna Davis',    carrier: 'USPS',  destination: 'Phoenix, AZ',     status: 'Delivered',   eta: 'Dec 2' },
    { trackingId: 'TRK-892336', orderId: '#7808', customer: 'Chris Lee',     carrier: 'UPS',   destination: 'San Antonio, TX', status: 'Returned',    eta: '-'     },
  ];

  get filtered(): Shipment[] {
    if (this.filterStatus === 'All') return this.shipments;
    return this.shipments.filter(s => s.status === this.filterStatus);
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/shipments`).subscribe({
      next: (data) => { if (data?.content) this.shipments = data.content; },
      error: () => {}
    });
  }
}
