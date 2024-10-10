import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitize } from 'class-sanitizer'; 

export class CreateChatDto {
  @IsNotEmpty()
  @Transform(({ value }) => sanitize(value)) 
  room: string;

  @IsNotEmpty()
  @Transform(({ value }) => sanitize(value)) 
  sender: string;

  @IsNotEmpty()
  @Transform(({ value }) => sanitize(value)) 
  message: string;
}
