import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AlertService} from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    private apiUrl = 'api/chat';
    private http: HttpClient = inject(HttpClient);
    private alertService: AlertService = inject(AlertService);

    sendMessage(message: string): Observable<{ response: string }> {
        return this.http.post<{ response: string }>(this.apiUrl, {message}).pipe(
            catchError((err: any) => {
                this.alertService.displayAlert(
                    'error',
                    'Lo siento, no pude comunicarme con el chatbot. Inténtalo de nuevo más tarde.',
                    'center',
                    'top',
                    ['error-snackbar']
                );
                console.error('Error al enviar mensaje al chatbot:', err);
                return throwError(() => new Error('Error al enviar mensaje al chatbot.'));
            })
        );
    }
}