import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  icon?: string;
}

const KEY = 'datapulse_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  // Signal tabanli state
  private _items = signal<CartItem[]>(this.load());

  readonly items = this._items.asReadonly();

  readonly count = computed(() =>
    this._items().reduce((s, i) => s + i.quantity, 0)
  );

  readonly total = computed(() =>
    this._items().reduce((s, i) => s + i.price * i.quantity, 0)
  );

  add(product: any, qty = 1) {
    const items = [...this._items()];
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        icon: product.icon
      });
    }
    this._items.set(items);
    this.save();
  }

  updateQty(productId: number, qty: number) {
    if (qty <= 0) return this.remove(productId);
    const items = this._items().map(i =>
      i.productId === productId ? { ...i, quantity: qty } : i
    );
    this._items.set(items);
    this.save();
  }

  remove(productId: number) {
    this._items.set(this._items().filter(i => i.productId !== productId));
    this.save();
  }

  clear() {
    this._items.set([]);
    this.save();
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save() {
    localStorage.setItem(KEY, JSON.stringify(this._items()));
  }
}
