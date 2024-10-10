import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { RoomService } from './room.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(ChatGateway.name);

    private onlineUsers: Map<string, string> = new Map(); 

    constructor(
        private readonly chatService: ChatService,
        private readonly roomService: RoomService,
    ) {}

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const username = this.onlineUsers.get(client.id);
        if (username) {
            this.logger.log(`${username} disconnected.`);
            this.onlineUsers.delete(client.id);
        }
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @MessageBody() { roomId, username }: { roomId: string, username: string },
        @ConnectedSocket() client: Socket,
    ) {
        this.onlineUsers.set(client.id, username);
        await this.roomService.addUserToRoom(roomId, client.id);
        client.join(roomId);
        this.server.to(roomId).emit('notification', `${username} has joined the room.`);
    }

    @SubscribeMessage('leaveRoom')
    async handleLeaveRoom(
        @MessageBody() roomId: string,
        @ConnectedSocket() client: Socket,
    ) {
        const username = this.onlineUsers.get(client.id);
        await this.roomService.removeUserFromRoom(roomId, client.id);
        client.leave(roomId);
        this.server.to(roomId).emit('notification', `${username} has left the room.`);
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() createChatDto: CreateChatDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const message = await this.chatService.create(createChatDto);
            this.server.to(createChatDto.room).emit('newMessage', message);
        } catch (error) {
            this.logger.error('Error in handleMessage', error.stack);
            client.emit('error', 'Could not send message.');
        }
    }

    @SubscribeMessage('getHistory')
    async handleGetHistory(
        @MessageBody() room: string,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const messages = await this.chatService.getMessageHistory(room);
            client.emit('messageHistory', messages.reverse());
        } catch (error) {
            this.logger.error('Error in handleGetHistory', error.stack);
            client.emit('error', 'Could not fetch message history.');
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @MessageBody() room: string,
        @ConnectedSocket() client: Socket,
    ) {
        const username = this.onlineUsers.get(client.id);
        client.broadcast.to(room).emit('typing', `${username} is typing...`);
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage('privateMessage')
    handlePrivateMessage(
        @MessageBody() data: { sender: string; recipient: string; message: string },
        @ConnectedSocket() client: Socket,
    ) {
        const targetClient = Array.from(this.server.sockets.sockets.values()).find(
            (socket) => this.onlineUsers.get(socket.id) === data.recipient
        );

        if (targetClient) {
            targetClient.emit('privateMessage', { sender: data.sender, message: data.message });
        } else {
            client.emit('error', 'User is not online.');
        }
    }
}
