import {Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ChatService} from "../../services/chat.service";

interface Message {
    content: string;
    sender: 'user' | 'bot';
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

    private chatService: ChatService = inject(ChatService);

    ngOnInit(): void {
        this.messages.push({content: "¡Hola! Soy tu chatbot educativo. ¿En qué puedo ayudarte hoy?", sender: 'bot'});
    }

    sendMessage(): void {
        if (this.newMessage.trim() === '') {
            return;
        }

        const userMessage = this.newMessage;
        this.messages.push({content: userMessage, sender: 'user'});
        this.newMessage = '';
        this.isLoading = true;

        this.chatService.sendMessage(userMessage).subscribe({
            next: (response) => {
                this.messages.push({content: response.response, sender: 'bot'});
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error sending message:', error);
                this.messages.push({
                    content: "Lo siento, tuve un problema al procesar tu solicitud. Inténtalo de nuevo más tarde.",
                    sender: 'bot'
                });
                this.isLoading = false;
            }
        });
    }
}
