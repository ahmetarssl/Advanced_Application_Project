import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  id: number;
  name: string;
  parent: string | null;
  productCount: number;
  icon: string;
}

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.html',
  styleUrls: ['./admin-categories.css']
})
export class AdminCategories {
  categories: Category[] = [
    { id: 1, name: 'Fashion',          parent: null,      productCount: 428, icon: '👗' },
    { id: 2, name: 'Men',              parent: 'Fashion', productCount: 210, icon: '👔' },
    { id: 3, name: 'Women',            parent: 'Fashion', productCount: 218, icon: '👗' },
    { id: 4, name: 'Electronics',      parent: null,      productCount: 312, icon: '💻' },
    { id: 5, name: 'Smartphones',      parent: 'Electronics', productCount: 145, icon: '📱' },
    { id: 6, name: 'Audio',            parent: 'Electronics', productCount: 87,  icon: '🎧' },
    { id: 7, name: 'Home & Garden',    parent: null,      productCount: 520, icon: '🏡' },
    { id: 8, name: 'Beauty',           parent: null,      productCount: 234, icon: '💄' },
    { id: 9, name: 'Sports',           parent: null,      productCount: 189, icon: '⚽' },
  ];

  showModal = false;
  newCategory = { name: '', parent: '' };
  searchTerm = '';

  get filtered(): Category[] {
    if (!this.searchTerm) return this.categories;
    return this.categories.filter(c => c.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  get parentCategories(): Category[] {
    return this.categories.filter(c => c.parent === null);
  }

  saveCategory() {
    const newId = Math.max(...this.categories.map(c => c.id)) + 1;
    this.categories.push({
      id: newId,
      name: this.newCategory.name,
      parent: this.newCategory.parent || null,
      productCount: 0,
      icon: '📦'
    });
    this.showModal = false;
    this.newCategory = { name: '', parent: '' };
  }

  deleteCategory(id: number) {
    this.categories = this.categories.filter(c => c.id !== id);
  }
}
