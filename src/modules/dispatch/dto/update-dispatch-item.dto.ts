import { PartialType } from '@nestjs/mapped-types';
import { CreateDispatchItemDTO } from './create-dispatch-item.dto';

export class UpdateDispatchItemDTO extends PartialType(CreateDispatchItemDTO) { }