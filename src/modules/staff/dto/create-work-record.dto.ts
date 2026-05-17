import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsUUID, Min, IsOptional } from 'class-validator';

export class CreateWorkRecordDto {
  @ApiProperty({
    description: 'ID del personal',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({
    description: 'Adelanto (Enviar 0 si no hay)',
    example: 20000.0,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  advance: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas realizadas el Lunes',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursMonday: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas realizadas el Martes',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursTuesday: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas realizadas el Miercoles',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursWednesday: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas realizadas el Jueves',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursThursday: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas realizadas el Viernes',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursFriday: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas realizadas el Sabado',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursSaturday: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas realizadas el Domingo',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursSunday: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas extras realizadas el Lunes',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursMondayExtra: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas extras realizadas el Martes',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursTuesdayExtra: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas extras realizadas el Miercoles',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursWednesdayExtra: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas extras realizadas el Jueves',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursThursdayExtra: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas extras realizadas el Viernes',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursFridayExtra: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas extras realizadas el Sabado',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursSaturdayExtra: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas extras realizadas el Domingo',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursSundayExtra: number;

  // Pago correspondiente a horas extras de la semana anterior que se pagan en esta liqudiacion
  @ApiProperty({
    description: 'Pago correspondiente por horas extras realizadas de semana anterior',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hoursLastWeek: number;

  @ApiProperty({
    description: 'Pago correspondiente por horas extras realizadas el Viernes de la semana anterior',
    example: 8,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  hoursFridayLastWeek: number;

  @ApiProperty({
    description: 'Fecha de inicio del registro de trabajo (Lunes de la semana)',
    example: '2023-10-02',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;
}