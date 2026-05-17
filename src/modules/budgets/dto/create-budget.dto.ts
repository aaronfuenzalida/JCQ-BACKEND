import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Min, IsUUID, IsNumber, IsString, IsOptional, IsDateString, IsArray, ValidateNested, IsBoolean, IsNotEmpty, ValidateIf, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBudgetItemDto } from './create-budget-item.dto';

import { CreateBudgetDescriptionItemDto } from './create-budget-description-item.dto';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'Fecha del presupuesto (formato ISO)',
    example: '2025-10-25T10:00:00Z'
  })
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha del presupuesto es requerida' })
  date: string; // formato ISO (ej: "2025-10-25T10:00:00Z")

  @ApiPropertyOptional({
    description: 'ID del cliente asociado al presupuesto',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
  })
  // Puede ser un cliente de la base de datos o un ingreso manual
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Nombre del cliente ingresado manualmente',
    example: 'Constructora XYZ S.A.'
  })
  @IsString()
  @IsOptional()
  manualClientName?: string;

  @ApiPropertyOptional({
    description: 'CUIT del cliente ingresado manualmente',
    example: '20-12345678-9'
  })
  @IsString()
  @IsOptional()
  manualClientCuit?: string;

  @ApiProperty({
    description: 'Lista de ítems incluidos en el presupuesto',
    type: [CreateBudgetItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true }) // Valida cada objeto dentro del array
  @Type(() => CreateBudgetItemDto) // Convierte el JSON a la clase DTO
  items: CreateBudgetItemDto[];

  @ApiPropertyOptional({
    description: 'Lista de ítems descriptivos adicionales',
    type: [CreateBudgetDescriptionItemDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetDescriptionItemDto)
  descriptionItems?: CreateBudgetDescriptionItemDto[];

  // MONTO NETO

  // MONTO NETO
  @ApiProperty({
    description: 'Monto neto del presupuesto (sin impuestos)',
    example: 100000.00,
  })
  @IsNumber()
  @Min(0)
  netAmount: number; // El usuario escribe el total 

  @ApiProperty({
    description: 'Indica si el presupuesto incluye IVA',
    example: true
  })
  @IsBoolean()
  hasIva: boolean;

  @ApiPropertyOptional()
  @ValidateIf(o => o.hasIva === true) // Si es que tiene iva el porcentaje es obligatorio
  @IsNumber()
  ivaPercentage?: number; //Ej:21

  @ApiProperty({
    description: 'Indica si el presupuesto incluye Ingresos Brutos (IIBB)',
    example: false
  })
  @IsBoolean()
  hasIibb: boolean;

  @ApiPropertyOptional({
    description: 'Porcentaje de IIBB aplicado (si corresponde)',
  })
  @ValidateIf(o => o.hasIibb === true) // Si es que tiene IIBB el porcentaje es obligatorio
  @IsNumber()
  iibbPercentage?: number; // Ej:3.5

  @ApiProperty({
    description: 'Indica si el presupuesto está cotizado en dólares',
    example: false
  })
  @IsBoolean()
  hasUSD: boolean;

  @ApiPropertyOptional({
    description: 'Valor del dólar utilizado para la cotización',
    example: 1100.50
  })
  @ValidateIf(o => o.hasUSD === true) // Si está en USD, el valor del dólar es obligatorio
  @IsNumber()
  @Min(0)
  usdValue?: number;
}