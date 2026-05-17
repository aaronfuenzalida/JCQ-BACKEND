import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BudgetDescriptionItemResponseDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    quantity: number;

    @ApiProperty()
    @Expose()
    price: number;

    @ApiPropertyOptional()
    @Expose()
    unit?: string;

    @ApiProperty()
    @Expose()
    budgetId: string;
}
