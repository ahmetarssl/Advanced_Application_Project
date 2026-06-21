import { CartService } from '../../services/cart.service';
import { Component, inject, OnInit, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

interface Product {
  id?: number; // Yeni ürün eklerken id henüz veritabanından gelmediği için opsiyonel yapıyoruz (?)
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
  imports: [CommonModule, FormsModule,],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class Products implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);
  cart = inject(CartService);


  canManage = computed(() => this.auth.isRole('ADMIN', 'CORPORATE'));

  searchTerm = '';
  selectedCategory = 'All';
  categories = ['All', 'Fashion', 'Electronics', 'Home', 'Beauty', 'Sports'];

  // 1. Mock verileri tamamen sildik, boş bir dizi ile başlatıyoruz.
  products: Product[] = [];

  showModal = false;
  editingProduct: Partial<Product> = {};

  get filtered(): Product[] {
    return this.products.filter(p => {
      const matchCat = this.selectedCategory === 'All' || p.category === this.selectedCategory;
      const matchSearch = !this.searchTerm || (p.name && p.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  // Veritabanından verileri çeken ana fonksiyonumuz
  loadProducts() {
    this.http.get<any>(`${environment.apiUrl}/products`).subscribe({
      next: (data) => {
        // Backend'in dönüş tipine göre (Spring Boot pagination veya doğrudan liste dönebilir) ayarlama yapıyoruz.
        this.products = data?.content ? data.content : data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ürünler getirilirken hata oluştu:', err);
      }
    });
  }

  openAdd() {
    this.editingProduct = { category: 'Fashion' };
    this.showModal = true;
  }

  openEdit(p: Product) {
    this.editingProduct = { ...p };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // 2. Formdan gelen veriyi Veritabanına kaydetme (Ekleme veya Güncelleme)
  saveProduct() {
    if (this.editingProduct.id) {
      // ID varsa, bu var olan bir üründür -> PUT isteği ile Güncelleme
      this.http.put(`${environment.apiUrl}/products/${this.editingProduct.id}`, this.editingProduct).subscribe({
        next: () => {
          this.loadProducts(); // Başarılı olursa listeyi veritabanından tekrar çek ve yenile
          this.showModal = false;
        },
        error: (err) => console.error('Ürün güncellenemedi:', err)
      });
    } else {
      // ID yoksa, bu yeni bir üründür -> POST isteği ile Ekleme
      this.http.post(`${environment.apiUrl}/products`, this.editingProduct).subscribe({
        next: () => {
          this.loadProducts(); // Başarılı olursa listeyi yenile
          this.showModal = false;
        },
        error: (err) => console.error('Ürün eklenemedi:', err)
      });
    }
  }

  // 3. Ürünü Veritabanından Silme
  deleteProduct(id: number) {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      this.http.delete(`${environment.apiUrl}/products/${id}`).subscribe({
        next: () => {
          // Başarılı silinirse, arayüzdeki diziden de o elemanı çıkarıyoruz
          this.products = this.products.filter(p => p.id !== id);
        },
        error: (err) => console.error('Ürün silinemedi:', err)
      });
    }
  }

  isLowStock(stock: number): boolean {
    return stock < 20;
  }
}
