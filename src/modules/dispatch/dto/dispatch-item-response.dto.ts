import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ProjectItemResponseDto } from '../../structures/dto';

export class DispatchItemResponseDTO {
    @ApiProperty({ description: 'ID del ítem de despacho' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'Cantidad despachada' })
    @Expose()
    quantity: number;

    @ApiProperty({ description: 'Datos del item del proyecto' })
    @Expose()
    @Type(() => ProjectItemResponseDto)
    projectItem: ProjectItemResponseDto;
}