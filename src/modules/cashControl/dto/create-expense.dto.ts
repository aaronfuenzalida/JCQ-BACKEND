import { ApiProperty} from '@nestjs/swagger';
import { Min,IsUUID, IsNumber, IsString,IsDateString,IsNotEmpty, IsOptional} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExpenseDTO{
    @ApiProperty({
        description:'Descripcion del gasto',
        example:'Carga de combustible para el proyecto N'
    })
    @IsString({message: 'La descripcion del gasto debe ser texto'})
    @IsNotEmpty({message:'La descripcion del gasto es obligatoria'})
    description:string;

    @ApiProperty({
        description:'Monto involucrado en el gasto',
        example: 50000
    })
    @IsNumber()
    @IsNotEmpty({message:'El monto pagado en el gasto es obligatorio'})
    @Min(0)
    amount:number;

    @ApiProperty({
        description:'Fecha en que se realizo el gasto',
        example:'2025-10-25T10:00:00Z'
    })  
    @IsDateString()
    @IsNotEmpty({ message: 'La fecha del gasto es requerida' })
    date: string;
    
    @ApiProperty({
    description: 'ID de la categoria de gasto asociada a este mismo gasto',
    })
    @IsUUID()
    @IsNotEmpty({message:'El gasto debe tener una categoria asignada'})
    categoryId: string;

    @IsOptional()
    @IsString()
    @IsUUID()
    workRecordId?: string;

}