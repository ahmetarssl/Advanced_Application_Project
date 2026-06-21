import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">💳 Ödeme</h1>

      @if (cart.items().length === 0) {
        <p class="text-gray-400">Sepet boş, önce ürün ekleyin.</p>
      } @else {
        <div class="bg-gray-800 p-6 rounded-lg space-y-4">

          <div class="border-b border-gray-700 pb-4">
            <div class="text-sm text-gray-400">Sipariş Özeti</div>
            <div class="text-2xl font-bold">{{ cart.total() | number:'1.2-2' }} TL</div>
            <div class="text-sm text-gray-400">{{ cart.count() }} adet ürün</div>
          </div>

          <div>
            <label class="block text-sm mb-1">Ad Soyad</label>
            <input [(ngModel)]="customerName"
                   class="w-full p-3 bg-gray-700 rounded outline-none focus:ring-2 ring-blue-500"
                   placeholder="Adınız Soyadınız">
          </div>

          <div>
            <label class="block text-sm mb-1">Teslimat Adresi</label>
            <textarea [(ngModel)]="address" rows="3"
                      class="w-full p-3 bg-gray-700 rounded outline-none focus:ring-2 ring-blue-500"
                      placeholder="Tam adres..."></textarea>
          </div>

          <div>
            <label class="block text-sm mb-1">Ödeme Yöntemi</label>
            <select [(ngModel)]="paymentMethod"
                    class="w-full p-3 bg-gray-700 rounded outline-none">
              <option value="CARD">Kredi Kartı</option>
              <option value="CASH">Kapıda Nakit</option>
              <option value="TRANSFER">Havale / EFT</option>
            </select>
          </div>

          @if (paymentMethod === 'CARD') {
            <div>
              <label class="block text-sm mb-1">Kart Son 4 Hanesi</label>
              <input [(ngModel)]="cardLast4" maxlength="4"
                     class="w-full p-3 bg-gray-700 rounded outline-none focus:ring-2 ring-blue-500"
                     placeholder="1234">
              <p class="text-xs text-gray-500 mt-1">
                Demo amaçlı — sadece son 4 hane kayıt edilir
              </p>
            </div>
          }

          @if (error()) {
            <div class="bg-red-900/50 p-3 rounded text-red-200 text-sm">
              {{ error() }}
            </div>
          }

          <button (click)="submit()"
                  [disabled]="loading()"
                  class="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50
                         rounded-lg font-semibold">
            {{ loading() ? 'İşleniyor...' : 'Siparişi Tamamla' }}
          </button>
        </div>
      }
    </div>
  `
})
export class CheckoutComponent {
  cart = inject(CartService);
  http = inject(HttpClient);
  router = inject(Router);

  customerName = '';
  address = '';
  paymentMethod = 'CARD';
  cardLast4 = '';

  loading = signal(false);
  error = signal<string | null>(null);

  async submit() {
    this.error.set(null);

    if (!this.customerName.trim() || !this.address.trim()) {
      this.error.set('Ad ve adres zorunlu.');
      return;
    }
    if (this.paymentMethod === 'CARD' && !/^\d{4}$/.test(this.cardLast4)) {
      this.error.set('Kart son 4 hanesi geçerli olmalı.');
      return;
    }

    this.loading.set(true);

    const body = {
      items: this.cart.items().map(i => ({
        productId: i.productId,
        quantity: i.quantity
      })),
      customerName: this.customerName,
      shippingAddress: this.address,
      paymentMethod: this.paymentMethod,
      cardLast4: this.paymentMethod === 'CARD' ? this.cardLast4 : null
    };

    try {
      const res: any = await this.http
        .post('http://localhost:8080/api/checkout', body)
        .toPromise();

      this.cart.clear();
      this.router.navigate(['/order-success'], {
        queryParams: { id: res.orderId, total: res.grandTotal }
      });
    } catch (e: any) {
      this.error.set(e?.error?.message || 'Sipariş oluşturulamadı');
    } finally {
      this.loading.set(false);
    }
  }
}
