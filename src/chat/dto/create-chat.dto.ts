import { IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  room: string;

  @IsNotEmpty()
  sender: string;

  @IsNotEmpty()
  message: string;
}
