import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EstimateService } from './estimate.service';
import { EstimatePreviewDto } from './dto/estimate.dto';

@ApiTags('Estimate')
@Controller('estimate')
export class EstimateController {
  constructor(private readonly estimateService: EstimateService) {}

  @Post('preview')
  @ApiOperation({ summary: 'Estimate preview (no save)' })
  @ApiOkResponse({
    description: 'Estimate result',
    schema: {
      example: {
        items: [
          {
            productId: 1,
            name: 'Cement M500',
            unit: 'kg',
            price: 350.5,
            quantity: 2,
            lineTotal: 701,
          },
        ],
        total: 701,
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  preview(@Body() dto: EstimatePreviewDto) {
    return this.estimateService.preview(dto);
  }
}
