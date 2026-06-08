---
name: nestjs-module
description: >-
  Scaffold NestJS feature modules with controller, service, DTOs, entity, and
  Swagger docs. Use when creating new API endpoints, features, or modules in
  blog-be/, or when the user asks to add a NestJS resource.
---

# NestJS Module Scaffold

## When to Use

Creating a new API resource in `blog-be/` (posts, categories, auth, comments, etc.).

Stack: **TypeORM** + **JWT/Passport** + PostgreSQL on **Railway**.

## Workflow

1. Read existing schema in `blog-fe/database_schema/supabase_db_schema.sql` for entity fields.
2. Check `blog-be/src/` for existing modules to match patterns.
3. Generate files in this order:

```
src/<feature>/
├── entities/<feature>.entity.ts
├── dto/create-<feature>.dto.ts
├── dto/update-<feature>.dto.ts
├── <feature>.service.ts
├── <feature>.controller.ts
└── <feature>.module.ts
```

4. Register `<Feature>Module` in `app.module.ts`.
5. Generate TypeORM migration: `npm run migration:generate -- src/migrations/AddFeature`.
6. Verify Swagger at `/api-docs`.

## Auth Module Reference

JWT auth lives in `src/auth/`:
- `auth.module.ts` — imports `JwtModule`, `PassportModule`
- `jwt.strategy.ts` — validates token, attaches `req.user`
- `jwt-auth.guard.ts` — `@UseGuards(JwtAuthGuard)` on protected routes
- Login endpoint returns `{ data: { accessToken, user } }`

## Entity Template

```typescript
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

Map snake_case DB columns with `@Column({ name: 'author_id' })`.

## DTO Template

```typescript
export class CreatePostDto {
  @ApiProperty({ example: 'My first post' })
  @IsString()
  @IsNotEmpty()
  title: string;
}
```

Use `PartialType(CreatePostDto)` for update DTOs.

## Controller Checklist

- [ ] `@ApiTags('<feature>')` on controller class
- [ ] `@ApiOperation()` on each endpoint
- [ ] `@ApiResponse()` for success and error codes
- [ ] `@UseGuards(JwtAuthGuard)` on protected routes
- [ ] Parse UUID params with `ParseUUIDPipe`

## Service Checklist

- [ ] Inject repository via constructor
- [ ] Throw `NotFoundException`, `ConflictException`, `BadRequestException`
- [ ] Keep business logic in service, not controller

## Do Not

- Put business logic in controllers
- Return raw TypeORM entities with relations uncontrolled
- Skip Swagger decorators
