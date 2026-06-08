import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

type ReqUser = { id: string; email: string; role: string };

@ApiTags('admin/posts')
@ApiBearerAuth()
@Controller('admin/posts')
@UseGuards(JwtAuthGuard)
export class PostsAdminController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách bài của tôi (draft + published)' })
  @ApiResponse({ status: 200, description: 'Mảng bài viết' })
  list(@Req() req: Request & { user: ReqUser }) {
    return this.posts.listMine(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết bài theo id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Bài viết' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài' })
  one(@Param('id') id: string, @Req() req: Request & { user: ReqUser }) {
    return this.posts.getMine(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo bài mới' })
  @ApiResponse({ status: 201, description: 'Bài viết đã tạo' })
  @ApiResponse({ status: 409, description: 'Slug đã tồn tại' })
  create(
    @Body() dto: CreatePostDto,
    @Req() req: Request & { user: ReqUser },
  ) {
    return this.posts.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật bài' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Bài viết đã cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @Req() req: Request & { user: ReqUser },
  ) {
    return this.posts.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: '{ deleted: true }' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài' })
  remove(@Param('id') id: string, @Req() req: Request & { user: ReqUser }) {
    return this.posts.remove(id, req.user.id);
  }
}
