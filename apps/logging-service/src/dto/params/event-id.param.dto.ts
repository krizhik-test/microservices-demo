import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EventIdParamDto {
  @ApiProperty({
    description: 'The MongoDB ID of the event',
    example: '6462a8f54f95bc47a8e68d32',
  })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;
}
