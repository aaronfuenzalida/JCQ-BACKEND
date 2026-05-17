import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, ValidateNested, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDispatchItemDTO } from './create-dispatch-item.dto';

export class CreateDispatchDTO {
    @ApiProperty({
        description: 'ID del proyecto asociado al despacho',
        example: 'uuid-del-proyecto'
    })
    @IsNotEmpty({ message: 'El proyecto es obligatorio' })
    @IsUUID('4', { message: 'El ID del proyecto debe ser un UUID válido' })
    projectId: string;

    @ApiProperty({
        description: 'Nombre del chofer',
        example: 'Juan'
    })
    @IsNotEmpty({ message: 'El nombre del chofer es obligatorio' })
    @IsString({ message: 'El nombre del chofer debe ser texto' })
    firstName: string;

    @ApiProperty({
        description: 'Apellido del chofer',
        example: 'Perez'
    })
    @IsNotEmpty({ message: 'El apellido del chofer es obligatorio' })
    @IsString({ message: 'El apellido del chofer debe ser texto' })
    lastName: string;

    @ApiProperty({
        description: 'CUIT del chofer',
        example: '20345678901'
    })
    @IsNotEmpty({ message: 'El CUIT es obligatorio' })
    @IsString({ message: 'El CUIT debe ser texto' })
    cuit: string;

    @ApiProperty({
        description: 'Patente del vehículo',
        example: 'ABC123'
    })
    @IsNotEmpty({ message: 'La patente es obligatoria' })
    @IsString({ message: 'La patente debe ser texto' })
    licensePlate: string;

    @ApiPropertyOptional({
        description: 'Descripción del despacho',
        example: 'Descripción adicional'
    })
    @IsOptional()
    @IsString({ message: 'La descripción debe ser texto' })
    notes?: string;

    @ApiProperty({
        description: 'Items del despacho',
        type: [CreateDispatchItemDTO]
    })
    @ValidateNested({ each: true })
    @Type(() => CreateDispatchItemDTO)
    @IsArray()
    items: CreateDispatchItemDTO[];
}