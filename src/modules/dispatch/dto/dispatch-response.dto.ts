import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { DispatchItemResponseDTO } from './dispatch-item-response.dto';
import { ProjectResponseDto } from '~/modules/projects/dto';

export class DispatchResponseDTO {
    @ApiProperty({
        description: 'ID del despacho',
    })
    @Expose()
    id: string;

    @ApiProperty({
        description: 'Número de remito autoincremental',
    })
    @Expose()
    dispatchNumber: number;

    @ApiProperty({
        description: 'ID del proyecto asociado',
    })
    @Expose()
    projectId: string;

    @ApiProperty({
        description: 'Proyecto asociado al despacho',
        type: ProjectResponseDto
    })
    @Expose()
    @Type(() => ProjectResponseDto)
    project: ProjectResponseDto;

    @ApiProperty({
        description: 'Nombre del chofer',
    })
    @Expose()
    firstName: string;

    @ApiProperty({
        description: 'Apellido del chofer',

    })
    @Expose()
    lastName: string;

    @ApiProperty({
        description: 'CUIT del chofer',
    })
    @Expose()
    cuit: string;

    @ApiProperty({
        description: 'Patente del vehículo encargado del despacho'
    })
    @Expose()
    licensePlate: string;

    @ApiPropertyOptional({
        description: 'Descripcion acerca del despacho'
    })
    @Expose()
    notes?: string;

    @ApiProperty({
        description: 'Lista de estructuras del despacho',
        type: [DispatchItemResponseDTO]
    })
    @Expose()
    @Type(() => DispatchItemResponseDTO)
    items: DispatchItemResponseDTO[];

    @ApiProperty({
        description: 'Fecha de creacion del despacho'
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de actualizacion del despacho'
    })
    @Expose()
    updatedAt: Date;

    @ApiProperty({
        description: 'Fecha de eliminacion del despacho'
    })
    @Expose()
    deletedAt: Date;
}