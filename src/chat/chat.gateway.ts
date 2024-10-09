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
  
  @WebSocketGateway()
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(ChatGateway.name);
  
    constructor(private readonly chatService: ChatService) {}
  
    handleConnection(client: Socket) {
      this.logger.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
      client.join(room);
      this.server.to(room).emit('notification', `${client.id} has joined the room.`);
    }
  
    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
      client.leave(room);
      this.server.to(room).emit('notification', `${client.id} has left the room.`);
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
    async handleGetHistory(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
      try {
        const messages = await this.chatService.getMessageHistory(room);
        client.emit('messageHistory', messages.reverse()); 
      } catch (error) {
        this.logger.error('Error in handleGetHistory', error.stack);
        client.emit('error', 'Could not fetch message history.');
      }
    }
  
    @SubscribeMessage('typing')
    handleTyping(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
      client.broadcast.to(room).emit('typing', `${client.id} is typing...`);
    }
  }
  