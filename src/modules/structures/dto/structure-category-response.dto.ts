import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StructureCategoryResponseDto {
    @ApiProperty({ description: 'ID de la categoría de estructura' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'Nombre de la categoría de estructura' })
    @Expose()
    name: string;

    @ApiPropertyOptional({ description: 'Descripción de la categoría de estructura' })
    @Expose()
    description?: string;

    @ApiProperty()
    @Expose()
    createdAt: Date;

    @ApiProperty()
    @Expose()
    updatedAt: Date;

    @ApiPropertyOptional()
    @Expose()
    deletedAt?: Date;
}
