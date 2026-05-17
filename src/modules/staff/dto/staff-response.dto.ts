import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StaffResponseDto {
  @ApiProperty({ description: 'ID del empleado' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Nombre del empleado' })
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'Apellido del empleado' })
  @Expose()
  lastName: string;

  @ApiPropertyOptional({ description: 'CUIT del empleado' })
  @Expose()
  cuit?: string;

  @ApiPropertyOptional({ description: 'DNI del empleado' })
  @Expose()
  dni?: string;

  @ApiPropertyOptional({ description: 'Categoria del empleado' })
  @Expose()
  category: string;

  @ApiPropertyOptional({description: 'Numero de telefono del empleado'})
  @Expose()
  numberPhone?: string;

  @ApiPropertyOptional({description: 'Direccion del empleado'})
  @Expose()
  adress?: string;

  @ApiPropertyOptional({description: 'Mail del empleado'})
  @Expose()
  email?: string;

  @ApiPropertyOptional({description: 'Mail del empleado'})
  @Expose()
  seniority?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Fecha de eliminación' })
  @Expose()
  deletedAt?: Date;
}

