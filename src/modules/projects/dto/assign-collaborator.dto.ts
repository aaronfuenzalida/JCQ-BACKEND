import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class AssignCollaboratorDto {
  @ApiProperty({ 
    description: 'ID del colaborador',
    example: 'uuid-del-colaborador' 
  })
  @IsUUID('4', { message: 'ID de colaborador inválido' })
  @IsNotEmpty({ message: 'El ID del colaborador es requerido' })
  collaboratorId: string;

  @ApiProperty({ 
    description: 'Cantidad de empleados asignados',
    example: 5 
  })
  @IsNumber()
  @Min(1, { message: 'Debe asignar al menos 1 empleado' })
  workersCount: number;

  @ApiProperty({ 
    description: 'Cantidad de horas estimadas/necesarias',
    example: 40.5
  })
  @IsNumber()
  @Min(0, { message: 'Las horas no pueden ser negativas' })
  hoursCount: number;
}