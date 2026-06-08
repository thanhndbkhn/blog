import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { parseLocale } from '../common/locale';
import { I18nService } from './i18n.service';

@ApiTags('i18n')
@Controller('i18n')
export class I18nController {
  constructor(private readonly i18n: I18nService) {}

  @Get()
  @ApiOperation({ summary: 'Chuỗi UI theo ngôn ngữ (vn | en)' })
  @ApiQuery({ name: 'ln', required: false, enum: ['vn', 'en'], example: 'vn' })
  @ApiResponse({ status: 200, description: '{ locale, strings: { key: value } }' })
  async bundle(@Query('ln') ln?: string) {
    const locale = parseLocale(ln);
    const strings = await this.i18n.getBundle(locale);
    return { locale, strings };
  }
}
