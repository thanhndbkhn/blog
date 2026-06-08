import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ example: 'Giới thiệu NestJS' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: 'gioi-thieu-nestjs' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug chỉ gồm chữ thường, số và dấu -',
  })
  slug!: string;

  @ApiProperty({ example: '# Hello\n\nNội dung markdown…' })
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiPropertyOptional({ enum: PostStatus, default: PostStatus.DRAFT })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({
    example: ['nestjs', 'prisma'],
    description: 'slug tag đã có (vd: nestjs, prisma)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagSlugs?: string[];
}
