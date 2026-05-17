import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WorkRecordResponseDto {
  @ApiProperty({ description: 'ID del personal' })
  @Expose()
  staffId: string;

  @ApiProperty({ description: 'Valor por hora' })
  @Expose()
  valuePerHour: number;

  @ApiProperty({ description: 'Adelanto del empleado' })
  @Expose()
  advance: number

  @ApiPropertyOptional({ description: 'Horas trabajadas el lunes' })
  @Expose()
  hoursMonday: number;

  @ApiPropertyOptional({ description: 'Horas trabajadas el martes' })
  @Expose()
  hoursTuesday: number;

  @ApiPropertyOptional({ description: 'Horas trabajadas el miercoles' })
  @Expose()
  hoursWednesday: number;

  @ApiPropertyOptional({ description: 'Horas trabajadas el jueves' })
  @Expose()
  hoursThursday: number;

  @ApiPropertyOptional({ description: 'Horas trabajadas el viernes' })
  @Expose()
  hoursFriday: number;

  @ApiPropertyOptional({ description: 'Horas trabajadas el sabado' })
  @Expose()
  hoursSaturday: number;

  @ApiPropertyOptional({ description: 'Horas trabajadas el domingo' })
  @Expose()
  hoursSunday: number;

  @ApiPropertyOptional({ description: 'Pago por horas extras trabajadas el lunes' })
  @Expose()
  hoursMondayExtra: number;

  @ApiPropertyOptional({ description: 'Pago por horas extras trabajadas el martes' })
  @Expose()
  hoursTuesdayExtra: number;

  @ApiPropertyOptional({ description: 'Pago por horas extras trabajadas el miercoles' })
  @Expose()
  hoursWednesdayExtra: number;

  @ApiPropertyOptional({ description: 'Pago por horas extras trabajadas el jueves' })
  @Expose()
  hoursThursdayExtra: number;

  @ApiPropertyOptional({ description: 'Pago por horas extras trabajadas el viernes' })
  @Expose()
  hoursFridayExtra: number;

  @ApiPropertyOptional({ description: 'Pago por horas extras trabajadas el sabado' })
  @Expose()
  hoursSaturdayExtra: number;

  @ApiPropertyOptional({ description: 'Pago por horas extras trabajadas el domingo' })
  @Expose()
  hoursSundayExtra: number;

  @ApiPropertyOptional({ description: 'Pago por horas extras trabajadas de la semana anterior' })
  @Expose()
  hoursLastWeek: number;

  @ApiPropertyOptional({ description: 'Pago por horas extras trabajadas el viernes de la semana anterior' })
  @Expose()
  hoursFridayLastWeek: number;

  @ApiPropertyOptional({ description: 'Fecha de inicio del registro de trabajo' })
  @Expose()
  startDate: Date;

  @ApiPropertyOptional({ description: 'Fecha de fin del registro de trabajo' })
  @Expose()
  endDate: Date;

  @ApiProperty({ description: 'Total a Pagar (Calculado)' })
  @Expose()
  total: number;

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

