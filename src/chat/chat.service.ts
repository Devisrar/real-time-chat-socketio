import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {}

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    try {
      const newChat = new this.chatModel(createChatDto);
      return await newChat.save();
    } catch (error) {
      this.logger.error(`Failed to save chat message: ${error.message}`, error.stack);
      throw new HttpException('Error saving message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMessageHistory(room: string): Promise<Chat[]> {
    try {
      return await this.chatModel
        .find({ room })
        .sort({ createdAt: -1 })
        .limit(10)
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get message history for room: ${room}`, error.stack);
      throw new HttpException('Error fetching message history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
