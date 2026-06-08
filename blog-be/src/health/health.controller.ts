import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check + trạng thái DB' })
  @ApiResponse({
    status: 200,
    description: '{ ok, service, db, ts }',
  })
  async getHealth() {
    let db = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {
      db = false;
    }
    return {
      ok: true,
      service: 'blog-be',
      db,
      ts: new Date().toISOString(),
    };
  }
}
