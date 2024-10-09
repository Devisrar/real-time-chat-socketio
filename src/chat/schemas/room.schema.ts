import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Room extends Document {
  @Prop({ required: true })
  roomId: string;

  @Prop({ type: [String], default: [] })
  users: string[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
