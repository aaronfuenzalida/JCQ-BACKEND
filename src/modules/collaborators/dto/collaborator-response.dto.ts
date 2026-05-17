import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ProjectResponseDto } from '~/modules/projects';

export class CollaboratorResponseDTO{
  @ApiProperty({ description: 'ID del colaborador' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Nombre del colaborador' })
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'Apellido del colaborador' })
  @Expose()
  lastName: string;

  @ApiPropertyOptional({ description: 'Proyectos en los que se encuentra involucrado el colaborador' })
  @Expose()
  Projects?: ProjectResponseDto[];

  @ApiPropertyOptional({ description: 'Razon social del colaborador' })
  @Expose()
  companyName?: string;

  @ApiPropertyOptional({ description: 'CUIT del colaborador' })
  @Expose()
  cuit?: string;

  @ApiPropertyOptional({ description: 'DNI del colaborador' })
  @Expose()
  dni?: string;

  @ApiPropertyOptional({ description: 'Cantidad de trabajadores que aporta' })
  @Expose()
  quantityWorkers : number

  @ApiPropertyOptional({ description: 'Valor por hora de los trabajadores' })
  @Expose()
  valuePerHour : number

  @ApiPropertyOptional({ description: 'Descripcion del colaborador' })
  @Expose()
  notes? : string

  @ApiProperty({ description: 'Fecha de creación' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'Fecha de eliminación', required: false })
  @Expose()
  deletedAt?: Date;


}