import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Review {
  id: number;
  customer: string;
  initials: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
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

  filterRating = 0;
  searchTerm = '';

  summaryCards = [
    { label: 'Avg Rating',  value: '4.8', icon: 'bi-star-fill',   color: 'icon-yellow' },
    { label: 'Total Reviews', value: '2,841', icon: 'bi-chat-left-text', color: 'icon-blue' },
    { label: '5-Star Reviews', value: '68%', icon: 'bi-emoji-smile', color: 'icon-green' },
    { label: 'Pending Response', value: '12', icon: 'bi-clock', color: 'icon-orange' },
  ];

  reviews: Review[] = [
    { id: 1, customer: 'Sarah Miller',  initials: 'SM', product: 'Classic Cotton T-Shirt',  rating: 5, comment: 'Amazing quality! The fabric is so soft and the fit is perfect.', date: 'Dec 2, 2024', helpful: 14 },
    { id: 2, customer: 'James Wilson',  initials: 'JW', product: 'Wireless Headphones',     rating: 4, comment: 'Great sound quality, comfortable to wear. Battery life could be better.', date: 'Dec 1, 2024', helpful: 8 },
    { id: 3, customer: 'Emily Johnson', initials: 'EJ', product: 'Smart Watch Series X',    rating: 5, comment: 'Best smartwatch I have ever owned. Highly recommend!', date: 'Nov 30, 2024', helpful: 22 },
    { id: 4, customer: 'Mike Brown',    initials: 'MB', product: 'Leather Handbag',         rating: 3, comment: 'Good product but the strap feels a bit flimsy.', date: 'Nov 29, 2024', helpful: 3 },
    { id: 5, customer: 'Anna Davis',    initials: 'AD', product: 'Running Sneakers Pro',    rating: 5, comment: 'Super comfortable! Used them in a marathon and my feet did not hurt at all.', date: 'Nov 28, 2024', helpful: 31 },
    { id: 6, customer: 'Chris Lee',     initials: 'CL', product: 'Designer Sunglasses',     rating: 2, comment: 'The quality does not match the price. Expected better.', date: 'Nov 27, 2024', helpful: 6 },
  ];

  get filtered(): Review[] {
    return this.reviews.filter(r => {
      const matchRating = this.filterRating === 0 || r.rating === this.filterRating;
      const matchSearch = !this.searchTerm || r.customer.toLowerCase().includes(this.searchTerm.toLowerCase()) || r.product.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchRating && matchSearch;
    });
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/reviews`).subscribe({
      next: (data) => { if (data?.content) this.reviews = data.content; },
      error: () => {}
    });
  }
}
