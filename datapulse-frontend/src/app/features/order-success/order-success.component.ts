import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-8 max-w-xl mx-auto text-center">
      <div class="text-6xl mb-4">✅</div>
      <h1 class="text-3xl font-bold mb-2">Siparişiniz Alındı!</h1>
      <p class="text-gray-400 mb-6">
        Sipariş No: <span class="text-white font-mono">#{{ orderId }}</span>
      </p>
      <div class="bg-gray-800 p-6 rounded-lg mb-6">
        <div class="text-gray-400 text-sm">Toplam Tutar</div>
        <div class="text-3xl font-bold">{{ total | number:'1.2-2' }} TL</div>
      </div>
      <div class="flex gap-3 justify-center">
        <a routerLink="/orders" class="px-6 py-2 bg-blue-600 rounded">Siparişlerim</a>
        <a routerLink="/products" class="px-6 py-2 bg-gray-700 rounded">Alışverişe Devam</a>
      </div>
    </div>
  `
})
export class OrderSuccessComponent {
  route = inject(ActivatedRoute);
  orderId = this.route.snapshot.queryParamMap.get('id');
  total = Number(this.route.snapshot.queryParamMap.get('total') || 0);
}
