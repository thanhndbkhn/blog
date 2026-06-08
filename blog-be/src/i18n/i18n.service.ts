import { Injectable } from '@nestjs/common';
import { Locale } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class I18nService {
  constructor(private readonly prisma: PrismaService) {}

  async getBundle(locale: Locale): Promise<Record<string, string>> {
    const rows = await this.prisma.i18nEntry.findMany({
      where: { locale },
      orderBy: { key: 'asc' },
    });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }
}
