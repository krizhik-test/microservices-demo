import { OmitType } from '@nestjs/swagger';
import { TimeSeriesQueryDto } from '../../../timeseries/dto/request';

export class ReportGenerationQueryDto extends OmitType(TimeSeriesQueryDto, [
  'aggregation',
]) {}
