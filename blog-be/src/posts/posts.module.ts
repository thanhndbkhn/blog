import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsPublicController } from './posts-public.controller';
import { PostsAdminController } from './posts-admin.controller';

@Module({
  controllers: [PostsPublicController, PostsAdminController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
