import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Customer {
  id?: number; // DB'den geleceği için esnek
  name: string;
  initials: string;
  city: string;
  membership: 'Gold' | 'Silver' | 'Bronze';
  totalSpend: string | number; // Backend'den sayı (number) formatında da gelebilir
  orders: number;
  status: 'Active' | 'Inactive';
}

// Özet kartları için de bir arayüz tanımlamak kodu daha güvenli (Type-Safe) yapar
interface SummaryCard {
  label: string;
  value: string | number;
  change: string;
  icon: string;
  color: string;
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
  private cdr = inject(ChangeDetectorRef);

  searchTerm = '';

  // 1. Mock verileri tamamen sildik, boş dizilerle başlatıyoruz.
  summaryCards: SummaryCard[] = [];
  customers: Customer[] = [];

  get filtered(): Customer[] {
    if (!this.searchTerm) return this.customers;
    const t = this.searchTerm.toLowerCase();

    // DB'den gelen verilerde null değer olma ihtimaline karşı (c.name &&) koruması ekledik
    return this.customers.filter(c =>
      (c.name && c.name.toLowerCase().includes(t)) ||
      (c.city && c.city.toLowerCase().includes(t))
    );
  }

  ngOnInit() {
    // Sayfa açıldığında her iki veriyi de paralel olarak çekiyoruz
    this.loadCustomers();
    this.loadSummaryCards();
  }

  // 2. Müşteri Tablosunu Dolduran Fonksiyon
  loadCustomers() {
    this.http.get<any>(`${environment.apiUrl}/customers`).subscribe({
      next: (data) => {
        // Backend'in yapısına göre (Spring Data JPA page dönüyorsa data.content, List dönüyorsa data)
        this.customers = data?.content ? data.content : data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Müşteriler veritabanından getirilirken hata:', err)
    });
  }

  // 3. Üstteki 4'lü İstatistik Kartlarını Dolduran Fonksiyon
  loadSummaryCards() {
    // Spring Boot tarafında bu istatistikleri hesaplayan bir endpoint olduğunu varsayıyoruz
    this.http.get<any>(`${environment.apiUrl}/customers/stats`).subscribe({
      next: (data) => {
        if (data) {
          this.summaryCards = data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Müşteri istatistikleri getirilirken hata:', err)
    });
  }
}
