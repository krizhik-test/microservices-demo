import { applyDecorators } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { FileUploadRequestDto } from "../dto/request/file-upload-request.dto";

export function ApiFile() {
  return applyDecorators(
    ApiBody({
      type: FileUploadRequestDto,
    })
  );
}
