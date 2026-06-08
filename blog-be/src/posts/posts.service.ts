import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Locale, PostStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePostDto } from './dto/create-post.dto';
import type { UpdatePostDto } from './dto/update-post.dto';

const postInclude = {
  author: { select: { id: true, email: true } },
  tags: { include: { tag: true } },
  translations: true,
} satisfies Prisma.PostInclude;

export type PostWithRelations = Prisma.PostGetPayload<{
  include: typeof postInclude;
}>;

function mapPost(p: PostWithRelations, locale: Locale = Locale.vn) {
  const en = p.translations.find((t) => t.locale === Locale.en);
  const useEn = locale === Locale.en && en;
  return {
    id: p.id,
    title: useEn ? en.title : p.title,
    slug: p.slug,
    body: useEn ? en.body : p.body,
    locale: useEn ? Locale.en : Locale.vn,
    status: p.status,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    author: p.author,
    tags: p.tags.map((pt) => ({ slug: pt.tag.slug, name: pt.tag.name })),
  };
}

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished(locale: Locale = Locale.vn) {
    const list = await this.prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      include: postInclude,
    });
    return list.map((p) => mapPost(p, locale));
  }

  async getPublishedBySlug(slug: string, locale: Locale = Locale.vn) {
    const post = await this.prisma.post.findFirst({
      where: { slug, status: PostStatus.PUBLISHED },
      include: postInclude,
    });
    if (!post) throw new NotFoundException('Không tìm thấy bài');
    return mapPost(post, locale);
  }

  async listMine(authorId: string) {
    const list = await this.prisma.post.findMany({
      where: { authorId },
      orderBy: { updatedAt: 'desc' },
      include: postInclude,
    });
    return list.map((p) => mapPost(p));
  }

  async getMine(id: string, authorId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, authorId },
      include: postInclude,
    });
    if (!post) throw new NotFoundException('Không tìm thấy bài');
    return mapPost(post);
  }

  async create(authorId: string, dto: CreatePostDto) {
    const exists = await this.prisma.post.findUnique({
      where: { slug: dto.slug },
    });
    if (exists) throw new ConflictException('Slug đã tồn tại');
    const status = dto.status ?? PostStatus.DRAFT;
    const publishedAt =
      status === PostStatus.PUBLISHED ? new Date() : null;
    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        body: dto.body,
        status,
        publishedAt,
        authorId,
      },
      include: postInclude,
    });
    if (dto.tagSlugs?.length) {
      const tags = await this.prisma.tag.findMany({
        where: { slug: { in: dto.tagSlugs } },
      });
      await this.prisma.postTag.createMany({
        data: tags.map((t) => ({ postId: post.id, tagId: t.id })),
        skipDuplicates: true,
      });
    }
    const full = await this.prisma.post.findUniqueOrThrow({
      where: { id: post.id },
      include: postInclude,
    });
    return mapPost(full);
  }

  async update(id: string, authorId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findFirst({
      where: { id, authorId },
    });
    if (!post) throw new NotFoundException('Không tìm thấy bài');
    if (dto.slug && dto.slug !== post.slug) {
      const clash = await this.prisma.post.findUnique({
        where: { slug: dto.slug },
      });
      if (clash) throw new ConflictException('Slug đã tồn tại');
    }
    let publishedAt = post.publishedAt;
    const nextStatus = dto.status ?? post.status;
    if (nextStatus === PostStatus.PUBLISHED && !publishedAt) {
      publishedAt = new Date();
    }
    if (nextStatus === PostStatus.DRAFT) publishedAt = null;
    await this.prisma.post.update({
      where: { id },
      data: {
        ...(dto.title != null && { title: dto.title }),
        ...(dto.slug != null && { slug: dto.slug }),
        ...(dto.body != null && { body: dto.body }),
        ...(dto.status != null && { status: dto.status }),
        publishedAt,
      },
    });
    if (dto.tagSlugs) {
      await this.prisma.postTag.deleteMany({ where: { postId: id } });
      const tags = await this.prisma.tag.findMany({
        where: { slug: { in: dto.tagSlugs } },
      });
      await this.prisma.postTag.createMany({
        data: tags.map((t) => ({ postId: id, tagId: t.id })),
      });
    }
    const full = await this.prisma.post.findUniqueOrThrow({
      where: { id },
      include: postInclude,
    });
    return mapPost(full);
  }

  async remove(id: string, authorId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, authorId },
    });
    if (!post) throw new NotFoundException('Không tìm thấy bài');
    await this.prisma.post.delete({ where: { id } });
    return { deleted: true };
  }
}
