import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Veri yapımızı güvenli hale getirmek için bir interface tanımlıyoruz
interface StoreInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
  status: string; // 'Open' | 'Closed'
  description: string;
}

@Component({
  selector: 'app-store-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store-settings.html',
  styleUrls: ['./store-settings.css']
})
export class StoreSettings implements OnInit {
  private http = inject(HttpClient);

  // 1. Mock verileri uçurduk, başlangıç için boş/varsayılan değerler veriyoruz
  store: StoreInfo = {
    name: '',
    email: '',
    phone: '',
    address: '',
    currency: 'USD',
    timezone: 'America/New_York',
    status: 'Closed',
    description: ''
  };

  currencies = ['USD', 'EUR', 'GBP', 'TRY'];
  timezones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Istanbul'];

  saveSuccess = false;

  ngOnInit() {
    // Sayfa açıldığında mağaza ayarlarını veritabanından çek
    this.loadStoreSettings();
  }

  // 2. Ayarları Backend'den Çekme İşlemi
  loadStoreSettings() {
    this.http.get<StoreInfo>(`${environment.apiUrl}/store/settings`).subscribe({
      next: (data) => {
        if (data) {
          this.store = data;
        }
      },
      error: (err) => console.error('Mağaza ayarları getirilirken hata oluştu:', err)
    });
  }

  // 3. Değişiklikleri Veritabanına (Backend'e) Kaydetme İşlemi
  onSave() {
    // Sadece sahte bir tik göstermek yerine veriyi PUT isteği ile Spring Boot'a fırlatıyoruz
    this.http.put(`${environment.apiUrl}/store/settings`, this.store).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (err) => console.error('Mağaza ayarları kaydedilemedi:', err)
    });
  }

  toggleStatus() {
    // Bu değişiklik arayüzde anında güncellenir,
    // kalıcı olması için kullanıcının "Kaydet" butonuna (onSave) basması gerekir.
    this.store.status = this.store.status === 'Open' ? 'Closed' : 'Open';
  }
}
