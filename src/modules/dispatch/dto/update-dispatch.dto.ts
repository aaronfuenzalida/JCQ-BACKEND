import { PartialType } from '@nestjs/mapped-types';
import { CreateDispatchDTO } from './create-dispatch.dto';

export class UpdateDispatchDTO extends PartialType(CreateDispatchDTO) { }