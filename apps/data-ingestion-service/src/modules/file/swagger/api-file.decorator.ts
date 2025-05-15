import { applyDecorators } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { FileUploadRequestDto } from '../dto/request';

export function ApiFile() {
  return applyDecorators(
    ApiBody({
      type: FileUploadRequestDto,
    }),
  );
}
