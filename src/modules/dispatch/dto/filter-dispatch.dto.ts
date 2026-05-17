import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';

export class FilterDispatchDTO {
    @ApiPropertyOptional({
        description: 'ID del proyecto',
    })
    @IsOptional()
    @IsUUID()
    projectId?: string;

    @ApiPropertyOptional({
        description: 'Fecha de inicio',
    })
    @IsOptional()
    @IsDateString()
    dateInit?: Date;

    @ApiPropertyOptional({
        description: 'Fecha de fin',
    })
    @IsOptional()
    @IsDateString()
    dateEnd?: Date;

    @ApiPropertyOptional({
        description: 'Cuit del chofer',
    })
    @IsOptional()
    @IsString()
    driverCuit?: string;

    @ApiPropertyOptional({
        description: 'Patente del vehículo',
    })
    @IsOptional()
    @IsString()
    licensePlate?: string;

    @ApiPropertyOptional({
        description: 'Nombre/Razon social del cliente',
    })
    @IsOptional()
    @IsString()
    clientName?: string;
}