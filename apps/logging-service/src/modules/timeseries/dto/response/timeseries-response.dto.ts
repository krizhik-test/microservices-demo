import { ApiProperty } from "@nestjs/swagger";

export class TimeSeriesDataPointDto {
  @ApiProperty({ description: "Timestamp of the data point" })
  timestamp: number;

  @ApiProperty({ description: "Value at the given timestamp" })
  value: number;
}

export class TimeSeriesDto {
  @ApiProperty({ description: "Key identifier for the time series" })
  key: string;

  @ApiProperty({
    description: "Labels associated with the time series",
    type: Object,
  })
  labels: Record<string, string>;

  @ApiProperty({
    description: "Array of time series data points",
    type: [TimeSeriesDataPointDto],
  })
  data: TimeSeriesDataPointDto[];
}
