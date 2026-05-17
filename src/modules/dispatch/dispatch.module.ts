import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
import { LocationService } from '~/common/utils';

@Module({
    controllers: [DispatchController],
    providers: [DispatchService, LocationService],
    exports: [DispatchService],
})
export class DispatchModule { }