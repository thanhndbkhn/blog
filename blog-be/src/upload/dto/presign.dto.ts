import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';

const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

export class PresignDto {
  @ApiProperty({
    enum: TYPES,
    example: 'image/png',
  })
  @IsString()
  @IsIn([...TYPES])
  contentType!: (typeof TYPES)[number];

  @ApiProperty({ example: 'cover.png' })
  @IsString()
  @MinLength(1)
  filename!: string;
}
