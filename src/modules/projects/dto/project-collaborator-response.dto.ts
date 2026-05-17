import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CollaboratorResponseDTO } from '~/modules/collaborators/dto';

export class ProjectCollaboratorResponseDto {
  @ApiProperty({ description: 'ID de la asignación' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Cantidad de empleados asignados' })
  @Expose()
  workersCount: number;

  @ApiProperty({ description: 'Cantidad de horas requeridas' })
  @Expose()
  hoursCount: number;

  @ApiProperty({ description: 'Precio por hora pactado (Snapshot)' })
  @Expose()
  valuePerHour: number;

  @ApiProperty({ description: 'Costo total de esta asignación' })
  @Expose()
  totalCost: number;

  @ApiProperty({ description: 'Datos del colaborador' })
  @Expose()
  @Type(() => CollaboratorResponseDTO)
  collaborator: CollaboratorResponseDTO;
}