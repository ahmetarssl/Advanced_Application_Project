import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; // Router buraya eklendi
import { HttpClient } from '@angular/common/http'; // HttpClient buraya eklendi
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-8 max-w-4xl mx-auto text-white">
      <h1 class="text-3xl font-bold mb-6">🛒 Sepetim</h1>

      @if (cart.items().length === 0) {
        <div class="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
          <p class="text-gray-400 mb-4">Sepetiniz şu an boş</p>
          <a routerLink="/products" class="text-blue-400 hover:text-blue-300 underline">
            Ürünlere göz at
          </a>
        </div>
      } @else {
        <div class="space-y-3">
          @for (item of cart.items(); track item.productId) {
            <div class="flex items-center gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div class="text-3xl">{{ item.icon || '📦' }}</div>
              <div class="flex-1">
                <div class="font-semibold text-lg">{{ item.name }}</div>
                <div class="text-sm text-gray-400">{{ item.price | number:'1.2-2' }} TL</div>
              </div>

              <div class="flex items-center gap-2">
                <button (click)="cart.updateQty(item.productId, item.quantity - 1)"
                        class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors">−</button>
                <span class="w-10 text-center font-medium">{{ item.quantity }}</span>
                <button (click)="cart.updateQty(item.productId, item.quantity + 1)"
                        class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors">+</button>
              </div>

              <div class="w-32 text-right font-bold text-blue-400">
                {{ item.price * item.quantity | number:'1.2-2' }} TL
              </div>

              <button (click)="cart.remove(item.productId)"
                      class="text-red-400 hover:text-red-300 px-2 transition-colors" title="Sil">🗑</button>
            </div>
          }
        </div>

        <div class="mt-6 p-6 bg-gray-800 rounded-lg border border-blue-900/30 flex items-center justify-between">
          <div>
            <div class="text-gray-400">Toplam ({{ cart.count() }} ürün)</div>
            <div class="text-3xl font-bold text-blue-400">{{ cart.total() | number:'1.2-2' }} TL</div>
          </div>
          <button (click)="checkout()"
                  class="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold shadow-lg transition-all active:scale-95">
            Ödemeye Geç →
          </button>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  public cart = inject(CartService);
  private http = inject(HttpClient);
  private router = inject(Router);

 checkout() {
  // 1. Tarayıcının hafızasından giriş yapmış kullanıcının token'ını al
  // Not: Giriş yaparken token'ı localStorage'a hangi isimle kaydettiysen ('token', 'jwt' vb.) onu yazmalısın.
  const token = localStorage.getItem('token');

  // 2. Token'ı HTTP Header'ına ekle
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  const orderItems = this.cart.items().map(item => ({
    productId: item.productId,
    quantity: item.quantity
  }));

  // 3. İsteği atarken headers'ı da gönder
  this.http.post('http://localhost:8080/api/products/decrease-stock', orderItems, { headers })
    .subscribe({
      next: () => {
        alert('Siparişiniz alındı, stoklar güncellendi!');
        this.cart.clear(); // Sepeti temizle
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Stok güncelleme hatası:', err);
        if (err.status === 403) {
          alert('Güvenlik Hatası (403): Oturumunuz süresi dolmuş veya token gönderilemedi. Lütfen tekrar giriş yapın.');
        } else {
          alert('Stok güncellenirken hata oluştu! Yetersiz stok olabilir.');
        }
      }
    });
}
}
