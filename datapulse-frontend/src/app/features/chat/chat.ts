import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartData } from 'chart.js';
import { ChartWrapper } from '../../shared/components/chart-wrapper/chart-wrapper';
import { ChatService } from './chat.service'; // Servisimizi ekledik

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  hasChart: boolean;
  chartData?: ChartData;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartWrapper],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class Chat {
  // Servisi component içine alıyoruz
  private chatService = inject(ChatService);

  userInput = '';
  isTyping = false;

  messages: ChatMessage[] = [
    {
      sender: 'ai',
      text: 'Merhaba! Ben DataPulse AI. E-ticaret verileriniz tam bir veri sızdırmazlık kalkanı ile korunmaktadır. Size nasıl yardımcı olabilirim?',
      hasChart: false
    }
  ];

  sendMessage() {
    if (!this.userInput.trim()) return;

    const query = this.userInput;
    this.messages.push({ sender: 'user', text: query, hasChart: false });
    this.userInput = '';
    this.isTyping = true;

    // GERÇEK BACKEND İSTEĞİ
    this.chatService.askAi(query).subscribe({
      next: (response) => {
        this.isTyping = false;
        this.messages.push({
          sender: 'ai',
          text: response.answer,
          hasChart: response.hasChart,
          chartData: response.chartData
        });
      },
      error: (err) => {
        this.isTyping = false;
        // Backend henüz kapalıysa veya hata verirse çökmemesi için güvenlik ağı
        this.messages.push({
          sender: 'ai',
          text: 'Şu an Spring Boot sunucusuna ulaşılamıyor. Lütfen backendin 8080 portunda çalıştığından emin olun.',
          hasChart: false
        });
      }
    });
  }
}
