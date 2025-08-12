import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ChatService} from "../../services/chat.service";
import {AuthService} from "../../services/auth.service";

interface Message {
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ]
})
export class ChatComponent implements OnInit {

    messages: Message[] = [];
    newMessage: string = '';
    isLoading: boolean = false;

    userName: string = 'Usuario';

    private chatService: ChatService = inject(ChatService);
    private authService: AuthService = inject(AuthService);

    ngOnInit(): void {
        const currentUser = this.authService.getUser();
        this.userName = currentUser?.name ?? 'Usuario';
        this.messages.push({
            content: "¡Hola! Soy tu chatbot educativo. ¿En qué puedo ayudarte hoy?",
            sender: 'bot',
            timestamp: new Date()
        });
    }

    sendMessage(): void {
        if (this.newMessage.trim() === '') {
            return;
        }

        const userMessage = this.newMessage;
        this.messages.push({
            content: userMessage,
            sender: 'user',
            timestamp: new Date()
        });
        this.newMessage = '';
        this.isLoading = true;

        this.chatService.sendMessage(userMessage).subscribe({
            next: (response) => {
                this.messages.push({
                    content: response.response,
                    sender: 'bot',
                    timestamp: new Date()
                });
                this.isLoading = false;
            },
            error: () => {
                this.messages.push({
                    content: "Lo siento, tuve un problema al procesar tu solicitud. Inténtalo de nuevo más tarde.",
                    sender: 'bot',
                    timestamp: new Date()
                });
                this.isLoading = false;
            }
        });
    }
}
