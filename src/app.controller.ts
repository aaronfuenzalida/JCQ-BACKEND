import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DolarService, DolarBlueResponse } from './common/services/dolar.service'; 

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dolarService: DolarService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('dolar')
  async getDolarPrice(): Promise<DolarBlueResponse> {
    return this.dolarService.getDolarBluePrice();
  }
}
