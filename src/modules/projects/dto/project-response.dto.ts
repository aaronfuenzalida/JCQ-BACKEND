import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type, Transform } from 'class-transformer';
import { ClientResponseDto } from '~/modules/clients/dto';
import { ProjectStatus } from '@prisma/client';
import { ProjectItemResponseDto } from '~/modules/structures/dto';
import { ProjectCollaboratorResponseDto } from './project-collaborator-response.dto';

export class ProjectResponseDto {
  @ApiProperty({ description: 'ID del proyecto' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Monto total del proyecto' })
  @Expose()
  amount: number;

  @ApiProperty({ description: 'Total pagado hasta ahora' })
  @Expose()
  totalPaid: number;

  @ApiProperty({ description: 'Restante a pagar' })
  @Expose()
  rest: number;

  @ApiProperty({ description: 'Estado del proyecto', enum: ProjectStatus })
  @Expose()
  status: ProjectStatus;

  @ApiPropertyOptional({ description: 'Precio del dólar al momento de activación' })
  @Expose()
  usdPrice?: any;

  @ApiPropertyOptional({ description: 'Evento relacionado al proyecto' })
  @Expose()
  event?: string;

  @ApiProperty({ description: 'ID del cliente' })
  @Expose()
  clientId: string;

  @ApiPropertyOptional({ description: 'Información del cliente', type: ClientResponseDto })
  @Expose()
  @Type(() => ClientResponseDto)
  client?: ClientResponseDto;

  @ApiPropertyOptional({ description: 'Dirección del proyecto' })
  @Expose()
  locationAddress?: string;

  @ApiPropertyOptional({ description: 'Latitud de la ubicación' })
  @Expose()
  locationLat?: number;

  @ApiPropertyOptional({ description: 'Longitud de la ubicación' })
  @Expose()
  locationLng?: number;

  @ApiProperty({ description: 'Cantidad de trabajadores' })
  @Expose()
  workers: number;

  @ApiProperty({ description: 'Fecha de inicio del proyecto' })
  @Expose()
  dateInit: Date;

  @ApiProperty({ description: 'Fecha de finalización del proyecto' })
  @Expose()
  dateEnd: Date;

  @ApiProperty({ description: 'Alias de items para el frontend', type: [ProjectItemResponseDto] })
  @Expose()
  @Transform(({ obj }) => obj.items || [])
  structures: ProjectItemResponseDto[];

  @ApiProperty({
    description: 'Lista de colaboradores asignados',
    type: [ProjectCollaboratorResponseDto]
  })
  @Expose()
  @Type(() => ProjectCollaboratorResponseDto)
  collaborators: ProjectCollaboratorResponseDto[];

  @ApiProperty({ description: 'Fecha de creación' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'Indica si el proyecto está cotizado en dólares' })
  @Expose()
  hasUSD: boolean;

  @ApiPropertyOptional({ description: 'Valor del dólar utilizado' })
  @Expose()
  usdValue?: number;

  @ApiPropertyOptional({ description: 'Monto total en USD' })
  @Expose()
  amountUSD?: number;

  @ApiPropertyOptional({ description: 'Fecha de eliminación' })
  @Expose()
  deletedAt?: Date;
}