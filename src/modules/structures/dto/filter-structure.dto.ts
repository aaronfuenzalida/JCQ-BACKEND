import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '~/modules/users/dto';

export class FilterStructureDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de categoría debe ser un UUID válido' })
  categoryId?: string;
}