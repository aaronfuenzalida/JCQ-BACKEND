import { ApiProperty } from '@nestjs/swagger';
import { Min, IsUUID, IsNumber } from 'class-validator';

export class CreateDispatchItemDTO {
    @ApiProperty({
        description: 'Cantidad despachada'
    })
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    @IsNumber()
    quantity: number;

    @ApiProperty({
        description: 'ID del item del proyecto (ProjectItem)'
    })
    @IsUUID('4', { message: 'El ID del item debe ser un UUID válido' })
    projectItemId: string;
}