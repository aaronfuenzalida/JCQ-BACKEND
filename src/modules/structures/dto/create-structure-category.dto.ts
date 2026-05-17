import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateStructureCategoryDto {
    @ApiProperty({
        description: 'Nombre de la categoría de estructura',
        example: 'Andamios Tubulares'
    })
    @IsString({ message: 'El nombre de la categoría debe ser texto' })
    @IsNotEmpty({ message: 'El nombre de la categoría es requerido' })
    name: string;

    @ApiPropertyOptional({
        description: 'Descripción de la categoría de estructura',
        example: 'Estructuras tubulares de acero galvanizado'
    })
    @IsString({ message: 'La descripción debe ser texto' })
    @IsOptional()
    description?: string;
}
