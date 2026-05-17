import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreateBudgetDescriptionItemDto {
    @ApiProperty({
        description: 'Título o descripción del ítem',
        example: 'Alquiler de Generador'
    })
    @IsString()
    @IsNotEmpty({ message: 'El título es requerido' })
    title: string;

    @ApiProperty({
        description: 'Precio unitario del ítem',
        example: 1500.00
    })
    @IsNumber()
    @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
    price: number;

    @ApiPropertyOptional({
        description: 'Unidad de medida del ítem (opcional)',
        example: 'Por hora'
    })
    @IsString()
    @IsOptional()
    unit?: string;

    @ApiPropertyOptional({
        description: 'Cantidad (opcional, por defecto 1)',
        example: 1
    })
    @IsNumber()
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    @IsOptional()
    quantity?: number;
}
