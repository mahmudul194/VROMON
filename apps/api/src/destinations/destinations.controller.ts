import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { DestinationsService } from './destinations.service';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get('meta')
  getMeta() {
    return this.destinationsService.getMeta();
  }

  @Get()
  findAll(
    @Query('division') division?: string,
    @Query('cost_level') cost_level?: string,
    @Query('search') search?: string,
  ) {
    return this.destinationsService.findAll({ division, cost_level, search });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.destinationsService.findOne(id);
  }
}
