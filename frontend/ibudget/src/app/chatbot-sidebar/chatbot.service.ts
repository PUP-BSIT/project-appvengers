import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatbotService {
    private http = inject(HttpClient);
    private readonly webhookUrl = 'https://n8n-j3he.onrender.com/webhook-test/3359fb07-339e-465f-9a4b-afc19a8e8f0b';

    sendMessage(message: string): Observable<any> {
        return this.http.post(this.webhookUrl, { message });
    }
}
