import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // Load ConfigModule to access .env variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config module global
    }),
    
    // Setup MongoDB using Mongoose with URI from .env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    ChatModule, // Import the Chat module for our real-time chat application
  ],
})
export class AppModule {}
