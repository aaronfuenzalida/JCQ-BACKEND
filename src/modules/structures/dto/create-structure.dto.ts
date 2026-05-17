import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsUUID
} from 'class-validator';

export class CreateStructureDto {

  @ApiProperty({ description: 'Nombre de la estructura', example: 'Andamio Tubular' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID de la categoría',
    example: 'uuid-de-la-categoria'
  })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsUUID('4', { message: 'El ID de categoría debe ser un UUID válido' })
  categoryId: string;

  @ApiProperty({ description: 'Stock inicial', example: 10 })
  @IsNotEmpty({ message: 'El stock es obligatorio' })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: 'Medida de la estructura', example: '1,85 x 1m' })
  @IsString({ message: 'La medida debe ser un texto' })
  @IsOptional()
  measure?: string;

  @ApiPropertyOptional({ description: 'Descripción de la estructura', example: 'Estructura metálica para construcción' })
  @IsString()
  @IsOptional()
  description?: string;


}