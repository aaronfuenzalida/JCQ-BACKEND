import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { StructureCategoryResponseDto } from './structure-category-response.dto';

export class StructureResponseDto {
    @ApiProperty({ description: 'ID de la estructura' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'Nombre de la estructura' })
    @Expose()
    name: string;

    @ApiProperty({ description: 'ID de la categoría de la estructura' })
    @Expose()
    categoryId: string;

    @ApiProperty({ description: 'Categoría de la estructura', type: () => StructureCategoryResponseDto })
    @Expose()
    @Type(() => StructureCategoryResponseDto)
    category: StructureCategoryResponseDto;

    @ApiProperty({ description: 'Stock disponible de la estructura' })
    @Expose()
    stock: number;

    @ApiPropertyOptional({ description: 'Medida de la estructura' })
    @Expose()
    measure?: string;

    @ApiPropertyOptional({ description: 'Descripción de la estructura' })
    @Expose()
    description?: string;

    @ApiProperty({ description: 'Cantidad en uso de la estructura' })
    @Expose()
    inUse: number;

    @ApiProperty({ description: 'Cantidad disponible de la estructura' })
    @Expose()
    available: number; // Calculado: stock - inUse
}