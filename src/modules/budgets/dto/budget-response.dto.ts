import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Type } from 'class-transformer';
import { BudgetItemResponseDto } from './budget-item-response.dto';
import { BudgetDescriptionItemResponseDto } from './budget-description-item-response.dto';
import { ClientResponseDto } from '../../clients/dto/client-response.dto';

export class BudgetResponseDto {
    @ApiProperty({ description: 'ID del presupuesto' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'Fecha del presupuesto' })
    @Expose()
    date: string;

    @ApiPropertyOptional({ description: 'ID del cliente' })
    @Expose()
    clientId?: string;

    @ApiPropertyOptional({ description: 'Datos del cliente de DB' })
    @Expose()
    client?: ClientResponseDto;

    @ApiPropertyOptional({ description: 'Nombre cliente manual' })
    @Expose()
    manualClientName?: string;

    @ApiPropertyOptional({ description: 'CUIT cliente manual' })
    @Expose()
    manualClientCuit?: string;

    @ApiProperty({ description: 'Monto neto (Sin impuestos)' })
    @Expose()
    netAmount: number;

    @ApiProperty({ description: 'Monto TOTAL FINAL (Con impuestos)' })
    @Expose()
    totalAmount: number;

    @ApiProperty()
    @Expose()
    hasIva: boolean;

    @ApiPropertyOptional()
    @Expose()
    ivaPercentage?: number;

    @ApiPropertyOptional({ description: 'Valor calculado del IVA en dinero' })
    @Expose()
    ivaValue?: number;

    @ApiProperty({ description: 'Indica si el presupuesto tiene IIBB aplicado' })
    @Expose()
    hasIibb: boolean;

    @ApiPropertyOptional()
    @Expose()
    iibbPercentage?: number;

    @ApiPropertyOptional({ description: 'Valor calculado de IIBB en dinero' })
    @Expose()
    iibbValue?: number;

    @ApiProperty({ description: 'Indica si el presupuesto está cotizado en dólares' })
    @Expose()
    hasUSD: boolean;

    @ApiPropertyOptional({ description: 'Valor del dólar utilizado para la cotización' })
    @Expose()
    usdValue?: number;

    @ApiPropertyOptional({ description: 'Monto total calculado en USD' })
    @Expose()
    totalAmountUSD?: number;

    @ApiProperty({ type: [BudgetItemResponseDto] })
    @Expose()
    @Type(() => BudgetItemResponseDto)
    items: BudgetItemResponseDto[];

    @ApiPropertyOptional({ type: [BudgetDescriptionItemResponseDto] })
    @Expose()
    @Type(() => BudgetDescriptionItemResponseDto)
    descriptionItems: BudgetDescriptionItemResponseDto[];

    @ApiProperty()
    @Expose()
    createdAt: Date;

    @ApiPropertyOptional()
    @Expose()
    deletedAt?: Date;
}