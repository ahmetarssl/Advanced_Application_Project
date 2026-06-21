import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Review {
  id?: number; // Veritabanından geleceği için opsiyonel yapıyoruz
  customer: string;
  initials: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

// Özet kartları için tip güvenliği (Type Safety) sağlıyoruz
interface SummaryCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.html',
  styleUrls: ['./reviews.css']
})
export class Reviews implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  filterRating = 0;
  searchTerm = '';

  // 1. Mock verileri uçurduk, boş listelerle başlıyoruz
  summaryCards: SummaryCard[] = [];
  reviews: Review[] = [];

  get filtered(): Review[] {
    return this.reviews.filter(r => {
      const matchRating = this.filterRating === 0 || r.rating === this.filterRating;

      // Veritabanından müşteri veya ürün adının boş (null) gelme ihtimaline karşı güvenlik kalkanı
      const matchSearch = !this.searchTerm ||
        (r.customer && r.customer.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (r.product && r.product.toLowerCase().includes(this.searchTerm.toLowerCase()));

      return matchRating && matchSearch;
    });
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  ngOnInit() {
    // Sayfa yüklendiğinde verileri backend'den iste
    this.loadReviews();
    this.loadSummaryCards();
  }

  // 2. Yorumları Veritabanından Çekme İşlemi
  loadReviews() {
    this.http.get<any>(`${environment.apiUrl}/reviews`).subscribe({
      next: (data) => {
        // Backend'in dönüş yapısına göre (Spring Data JPA page veya List)
        this.reviews = data?.content ? data.content : data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Yorumlar getirilirken hata oluştu:', err)
    });
  }

  // 3. Üstteki 4'lü İstatistik Kartlarını Çekme İşlemi
  loadSummaryCards() {
    this.http.get<any>(`${environment.apiUrl}/reviews/stats`).subscribe({
      next: (data) => {
        if (data) this.summaryCards = data;
      },
      error: (err) => console.error('Yorum istatistikleri getirilirken hata oluştu:', err)
    });
  }

  // 4. (Ekstra) Uygunsuz Yorumları Silme İşlemi
  deleteReview(id: number) {
    if (confirm('Bu yorumu tamamen silmek istediğinize emin misiniz?')) {
      this.http.delete(`${environment.apiUrl}/reviews/${id}`).subscribe({
        next: () => {
          // Backend'den başarıyla silinirse arayüzdeki listeden de kaldırıyoruz
          this.reviews = this.reviews.filter(r => r.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Yorum silinemedi:', err)
      });
    }
  }
}
