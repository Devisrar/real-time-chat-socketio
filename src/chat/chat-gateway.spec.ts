import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RoomService } from './room.service';
import { Server, Socket } from 'socket.io';

describe('ChatGateway', () => {
  let chatGateway: ChatGateway;
  let chatService: ChatService;
  let roomService: RoomService;
  let mockServer: Server;
  let client: Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: {
            create: jest.fn(),
            getMessageHistory: jest.fn(),
          },
        },
        {
          provide: RoomService,
          useValue: {
            addUserToRoom: jest.fn(),
            removeUserFromRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    chatGateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    roomService = module.get<RoomService>(RoomService);

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as Server;

    // Simulate connected WebSocket server
    chatGateway.server = mockServer;

    // Mocking a client
    client = {
      id: 'mock-client-id',
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      broadcast: {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      },
    } as unknown as Socket;
  });

  it('should handle connection', () => {
    const logSpy = jest.spyOn(chatGateway['logger'], 'log');

    chatGateway.handleConnection(client);

    expect(logSpy).toHaveBeenCalledWith(`Client connected: ${client.id}`);
  });

  it('should join a room and broadcast a notification', async () => {
    const roomId = 'room123';
    const username = 'test-user'; // Correct structure
  
    await chatGateway.handleJoinRoom({ roomId, username }, client);
  
    expect(roomService.addUserToRoom).toHaveBeenCalledWith(roomId, client.id);
    expect(client.join).toHaveBeenCalledWith(roomId);
    expect(mockServer.to).toHaveBeenCalledWith(roomId);
    expect(mockServer.emit).toHaveBeenCalledWith('notification', `${username} has joined the room.`);
  });
  
  it('should send a message to a room', async () => {
    const messageDto = {
      room: 'room123',
      sender: 'test-user',
      message: 'Hello, World!',
    };
    const savedMessage = { ...messageDto, createdAt: new Date() };

    (chatService.create as jest.Mock).mockResolvedValue(savedMessage);

    await chatGateway.handleMessage(messageDto, client);

    expect(chatService.create).toHaveBeenCalledWith(messageDto);
    expect(mockServer.to).toHaveBeenCalledWith(messageDto.room);
    expect(mockServer.emit).toHaveBeenCalledWith('newMessage', savedMessage);
  });

  it('should return message history to the client', async () => {
    const room = 'room123';
    const messages = [
      { message: 'Message 1', createdAt: new Date() },
      { message: 'Message 2', createdAt: new Date() },
    ];

    (chatService.getMessageHistory as jest.Mock).mockResolvedValue(messages);

    await chatGateway.handleGetHistory(room, client);

    expect(chatService.getMessageHistory).toHaveBeenCalledWith(room);
    expect(client.emit).toHaveBeenCalledWith('messageHistory', messages.reverse());
  });

});
