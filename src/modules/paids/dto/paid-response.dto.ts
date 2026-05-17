import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ProjectResponseDto } from '~/modules/projects/dto';

export class PaidResponseDto {
  @ApiProperty({ description: 'ID del pago' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Número secuencial del pago', example: '001-00001' })
  @Expose()
  number: string;

  @ApiProperty({ description: 'Monto del pago' })
  @Expose()
  amount: number;

  @ApiProperty({ description: 'Fecha del pago' })
  @Expose()
  date: Date;

  @ApiProperty({ description: 'Código de factura relacionada' })
  @Expose()
  bill: string;

  @ApiProperty({ description: 'ID del proyecto' })
  @Expose()
  projectId: string;

  @ApiPropertyOptional({ description: 'Información del proyecto', type: ProjectResponseDto })
  @Expose()
  @Type(() => ProjectResponseDto)
  project?: ProjectResponseDto;

  @ApiProperty({ description: 'Fecha de creación' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'Indica si el pago fue en dólares' })
  @Expose()
  hasUSD: boolean;

  @ApiPropertyOptional({ description: 'Valor del dólar utilizado' })
  @Expose()
  usdValue?: number;

  @ApiPropertyOptional({ description: 'Monto del pago en USD' })
  @Expose()
  amountUSD?: number;

  @ApiPropertyOptional({ description: 'Fecha de eliminación' })
  @Expose()
  deletedAt?: Date;
}

