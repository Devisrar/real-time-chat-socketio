import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';

@Injectable()
export class RoomService {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  async addUserToRoom(roomId: string, userId: string): Promise<void> {
    await this.roomModel.findOneAndUpdate(
      { roomId },
      { $addToSet: { users: userId } },
      { upsert: true }
    );
  }

  async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    await this.roomModel.findOneAndUpdate(
      { roomId },
      { $pull: { users: userId } }
    );
  }
}
