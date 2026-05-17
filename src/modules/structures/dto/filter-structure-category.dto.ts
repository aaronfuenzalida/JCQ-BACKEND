import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterStructureCategoryDto {
    @ApiPropertyOptional({
        description: 'Nombre de la categoría'
    })
    @IsOptional()
    @IsString()
    name?: string;
}
