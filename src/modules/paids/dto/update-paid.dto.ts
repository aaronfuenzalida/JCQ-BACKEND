import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional, Min, IsString, IsBoolean, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePaidDto {
  @ApiPropertyOptional({
    description: 'Monto del pago',
    example: 50000.00
  })
  @IsNumber({}, { message: 'Monto debe ser un número' })
  @Min(0.01, { message: 'Monto debe ser mayor a 0' })
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Fecha del pago',
    example: '2025-02-15T10:00:00Z'
  })
  @IsDateString({}, { message: 'Fecha debe ser una fecha válida' })
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    description: 'Código de factura relacionada',
    example: 'FC-2025-001'
  })
  @IsString({ message: 'Código de factura debe ser texto' })
  @IsOptional()
  bill?: string;

  @ApiPropertyOptional({
    description: 'Indica si el pago fue realizado en dólares',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  hasUSD?: boolean;

  @ApiPropertyOptional({
    description: 'Valor del dólar utilizado para la cotización',
    example: 1100.50
  })
  @ValidateIf(o => o.hasUSD === true)
  @IsNumber({}, { message: 'Valor del dólar debe ser un número' })
  @Min(0.01, { message: 'Valor del dólar debe ser mayor a 0' })
  @IsOptional()
  usdValue?: number;

  @ApiPropertyOptional({
    description: 'Monto del pago en USD (si aplica)',
    example: 50.00
  })
  @ValidateIf(o => o.hasUSD === true)
  @IsNumber({}, { message: 'Monto USD debe ser un número' })
  @Min(0.01, { message: 'Monto USD debe ser mayor a 0' })
  @IsOptional()
  amountUSD?: number;
}
