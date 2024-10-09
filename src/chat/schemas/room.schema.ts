import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true })
  roomId: string;

  @Prop({ type: [String], default: [] })
  users: string[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
