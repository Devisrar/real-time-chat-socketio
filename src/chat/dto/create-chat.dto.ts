import { IsString, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  readonly room: string;

  @IsString()
  @IsNotEmpty()
  readonly sender: string;

  @IsString()
  @IsNotEmpty()
  readonly message: string;
}
