import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PresignDto } from './dto/presign.dto';
import { UploadService } from './upload.service';

@ApiTags('admin/upload')
@ApiBearerAuth()
@Controller('admin/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly upload: UploadService) {}

  @Post('presign')
  @ApiOperation({
    summary: 'Presigned PUT URL — browser PUT file lên uploadUrl',
  })
  @ApiResponse({
    status: 200,
    description: '{ uploadUrl, publicUrl, key, contentType }',
  })
  @ApiResponse({ status: 503, description: 'S3/MinIO chưa cấu hình' })
  presign(@Body() dto: PresignDto) {
    return this.upload.presignPut(dto.contentType, dto.filename);
  }
}
