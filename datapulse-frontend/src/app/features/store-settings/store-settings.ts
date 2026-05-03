import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-store-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store-settings.html',
  styleUrls: ['./store-settings.css']
})
export class StoreSettings {
  store = {
    name: 'My Awesome Store',
    email: 'store@datapulse.com',
    phone: '+1 (555) 234-5678',
    address: '123 Commerce Street, New York, NY 10001',
    currency: 'USD',
    timezone: 'America/New_York',
    status: 'Open',
    description: 'Premium quality products for everyday use.'
  };

  currencies = ['USD', 'EUR', 'GBP', 'TRY'];
  timezones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Istanbul'];

  saveSuccess = false;

  onSave() {
    this.saveSuccess = true;
    setTimeout(() => this.saveSuccess = false, 3000);
  }

  toggleStatus() {
    this.store.status = this.store.status === 'Open' ? 'Closed' : 'Open';
  }
}
