import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

interface Product {
  id: number;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  icon: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class Products implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  canManage = computed(() => this.auth.isRole('ADMIN', 'CORPORATE'));

  searchTerm = '';
  selectedCategory = 'All';
  categories = ['All', 'Fashion', 'Electronics', 'Home', 'Beauty', 'Sports'];

  products: Product[] = [
    { id: 1, name: 'Classic Cotton T-Shirt',    category: 'Fashion',     sku: 'TSH-001', price: 29.99,  stock: 124, icon: '👕' },
    { id: 2, name: 'Running Sneakers Pro',       category: 'Sports',      sku: 'SNK-048', price: 89.99,  stock: 56,  icon: '👟' },
    { id: 3, name: 'Wireless Headphones',        category: 'Electronics', sku: 'HP-209',  price: 149.99, stock: 32,  icon: '🎧' },
    { id: 4, name: 'Smart Watch Series X',       category: 'Electronics', sku: 'SW-512',  price: 299.99, stock: 18,  icon: '⌚' },
    { id: 5, name: 'Leather Handbag',            category: 'Fashion',     sku: 'HB-774',  price: 199.99, stock: 43,  icon: '👜' },
    { id: 6, name: 'Designer Sunglasses',        category: 'Fashion',     sku: 'SG-331',  price: 129.99, stock: 67,  icon: '🕶️' },
    { id: 7, name: 'Premium Lipstick Set',       category: 'Beauty',      sku: 'LS-820',  price: 49.99,  stock: 89,  icon: '💄' },
    { id: 8, name: 'Decorative Lamp',            category: 'Home',        sku: 'DL-190',  price: 79.99,  stock: 34,  icon: '🪔' },
  ];

  showModal = false;
  editingProduct: Partial<Product> = {};

  get filtered(): Product[] {
    return this.products.filter(p => {
      const matchCat = this.selectedCategory === 'All' || p.category === this.selectedCategory;
      const matchSearch = !this.searchTerm || p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/products`).subscribe({
      next: (data) => { if (data?.content) this.products = data.content; },
      error: () => {}
    });
  }

  openAdd() { this.editingProduct = { category: 'Fashion' }; this.showModal = true; }
  openEdit(p: Product) { this.editingProduct = { ...p }; this.showModal = true; }
  closeModal() { this.showModal = false; }
  saveProduct() { this.showModal = false; }

  deleteProduct(id: number) {
    this.products = this.products.filter(p => p.id !== id);
  }

  isLowStock(stock: number): boolean { return stock < 20; }
}
