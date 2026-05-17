import { PartialType } from '@nestjs/mapped-types';
import { CreateStructureCategoryDto } from './create-structure-category.dto';

export class UpdateStructureCategoryDto extends PartialType(CreateStructureCategoryDto) { }
