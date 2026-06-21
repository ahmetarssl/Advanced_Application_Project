import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Shipment {
  trackingId: string; // Genelde kargolarda ID yerine Takip No (Tracking ID) kullanılır
  orderId: string;
  customer: string;
  carrier: string;
  destination: string;
  status: 'In Transit' | 'Processing' | 'Delivered' | 'Returned';
  eta: string;
}

// Kartlar için de tip güvenliği (Type Safety) sağlıyoruz
interface SummaryCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
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
  private cdr = inject(ChangeDetectorRef);
  filterStatus = 'All';
  statuses = ['All', 'In Transit', 'Processing', 'Delivered', 'Returned'];

  // 1. Mock verileri tamamen sildik, boş dizilerle başlatıyoruz.
  summaryCards: SummaryCard[] = [];
  shipments: Shipment[] = [];

  get filtered(): Shipment[] {
    if (this.filterStatus === 'All') return this.shipments;
    // Veritabanından status'ün null gelme ihtimaline karşı ufak bir güvenlik kontrolü
    return this.shipments.filter(s => s.status && s.status === this.filterStatus);
  }

  ngOnInit() {
    // Sayfa açıldığında hem listeyi hem de istatistikleri eş zamanlı çekiyoruz
    this.loadShipments();
    this.loadSummaryCards();
  }

  // 2. Kargo Listesini Veritabanından Çeken Fonksiyon
  loadShipments() {
    this.http.get<any>(`${environment.apiUrl}/shipments`).subscribe({
      next: (data) => {
        // Backend'in dönüş tipine göre (Spring Data JPA page dönüyorsa data.content, List dönüyorsa data)
        this.shipments = data?.content ? data.content : data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Kargolar veritabanından getirilirken hata oluştu:', err)
    });
  }

  // 3. Üstteki 4'lü İstatistik Kartlarını Dolduran Fonksiyon
  loadSummaryCards() {
    this.http.get<any>(`${environment.apiUrl}/shipments/stats`).subscribe({
      next: (data) => {
        if (data) this.summaryCards = data;
      },
      error: (err) => console.error('Kargo istatistikleri getirilirken hata oluştu:', err)
    });
  }

  // 4. (Ekstra) Kargo Durumunu Güncelleme Metodu
  // Yönetici arayüzünde "Kargoya Verildi" vs. butonlarına tıklanınca çalışması için
  updateShipmentStatus(trackingId: string, newStatus: string) {
    this.http.patch(`${environment.apiUrl}/shipments/${trackingId}/status`, { status: newStatus }).subscribe({
      next: () => {
        this.loadShipments(); // Güncelleme başarılı olursa listeyi veritabanından tekrar çek
      },
      error: (err) => console.error('Kargo durumu güncellenemedi:', err)
    });
  }
}
