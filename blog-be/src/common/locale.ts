import { BadRequestException } from '@nestjs/common';
import { Locale } from '@prisma/client';

const LOCALES: Locale[] = [Locale.vn, Locale.en];

export function parseLocale(ln?: string): Locale {
  if (!ln || ln === Locale.vn) return Locale.vn;
  if (ln === Locale.en) return Locale.en;
  throw new BadRequestException('Query ln chỉ hỗ trợ vn hoặc en');
}

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
