import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { parseLocale } from '../common/locale';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsPublicController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách bài đã publish' })
  @ApiQuery({ name: 'ln', required: false, enum: ['vn', 'en'], example: 'vn' })
  @ApiResponse({ status: 200, description: 'Mảng bài viết' })
  list(@Query('ln') ln?: string) {
    return this.posts.listPublished(parseLocale(ln));
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Chi tiết bài theo slug (published)' })
  @ApiParam({ name: 'slug', example: 'hello-world' })
  @ApiQuery({ name: 'ln', required: false, enum: ['vn', 'en'], example: 'vn' })
  @ApiResponse({ status: 200, description: 'Bài viết' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài' })
  bySlug(@Param('slug') slug: string, @Query('ln') ln?: string) {
    return this.posts.getPublishedBySlug(slug, parseLocale(ln));
  }
}
