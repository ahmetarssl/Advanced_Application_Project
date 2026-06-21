import { Component, inject, OnInit, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

interface Order {
  id?: string | number; // Veritabanından geleceği için esnek bıraktık
  customer: string;
  initials: string;
  products: number;
  total: string | number; // Backend'den sayı (number) olarak da gelebilir
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
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  isCorporateOrAdmin = computed(() => this.auth.isRole('ADMIN', 'CORPORATE'));

  filterStatus = 'All Status';
  filterTime = 'All Time';
  searchTerm = '';

  statuses = ['All Status', 'Completed', 'Shipped', 'Pending', 'Cancelled'];

  // 1. Mock verileri tamamen sildik, boş bir dizi ile başlatıyoruz.
  allOrders: Order[] = [];

  get filteredOrders(): Order[] {
    return this.allOrders.filter(o => {
      const matchStatus = this.filterStatus === 'All Status' || o.status === this.filterStatus;

      // DB'den gelen verilerde null değer olma ihtimaline karşı güvenlik önlemi ekledik (o.customer && ...)
      const matchSearch = !this.searchTerm ||
        (o.customer && o.customer.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (o.id && o.id.toString().toLowerCase().includes(this.searchTerm.toLowerCase()));

      return matchStatus && matchSearch;
    });
  }

  ngOnInit() {
    // Sayfa açılır açılmaz veritabanına istek at
    this.loadOrders();
  }

  // 2. Veritabanından Siparişleri Çeken Ana Fonksiyon
  loadOrders() {
    this.http.get<any>(`${environment.apiUrl}/orders`).subscribe({
      next: (data) => {
        // Backend'in dönüş tipine göre (Spring Boot pagination veya doğrudan liste dönebilir) ayarlama yapıyoruz.
        this.allOrders = data?.content ? data.content : data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Siparişler veritabanından getirilirken hata oluştu:', err);
      }
    });
  }

  // (Opsiyonel) 3. Sipariş Durumunu Güncelleme Metodu
  // Eğer arayüzde statüsü "Kargolandı" vs. yapmak için bir buton eklersen bu fonksiyonu çağırabilirsin.
  updateOrderStatus(orderId: string | number, newStatus: string) {
    this.http.patch(`${environment.apiUrl}/orders/${orderId}/status`, { status: newStatus }).subscribe({
      next: () => {
        this.loadOrders(); // Başarılı olursa listeyi veritabanından tekrar çek ve yenile
      },
      error: (err) => console.error('Sipariş durumu güncellenemedi:', err)
    });
  }

  getStatusClass(status: string): string {
    return status ? status.toLowerCase() : '';
  }
}
