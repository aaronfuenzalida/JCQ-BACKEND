import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, ValidateIf,IsNotEmpty} from 'class-validator';

export class CreateCollaboratorDTO{
    @ApiPropertyOptional({
        description:'Nombre del colaborador',
        example:'Martin'
    })
    @IsOptional()
    @ValidateIf((o) => !o.companyName)
    @IsString({message: 'El nombre debe ser texto'})
    firstName?: string

    @ApiPropertyOptional({ 
    description: 'Apellido del personal',
    example: 'Martinez'
      })
    @IsOptional()
    @ValidateIf((o) => !o.companyName)
    @IsString({message: 'El nombre debe ser texto'})
    lastName?: string;
    
    @ApiPropertyOptional({
        description:'Razon social',
        example: 'EmpresaX'
    })
    @IsOptional()
    @ValidateIf((o) => !o.firstName && !o.lastName)
    @IsString({message:'La razon social debe ser texto'})
    companyName?: string

    @ApiPropertyOptional({              //CUIT O DNI!!
        description: 'CUIT del colaborador (solo números o string, sin formato)',
        example: '20123456789'
    })
    @ValidateIf((o) => !o.dni)
    @IsOptional()
    @IsString({message:'El cuit debe ser string'})
    cuit?: string

    @ApiPropertyOptional({              //CUIT O DNI !!
        description: 'DNI del colaborador(solo números o string)',
        example: '12345678'
    })
    @IsOptional()
    @ValidateIf((o) => !o.cuit)
    @IsString({message:'El DNI debe ser string'})
    dni?: string

    @ApiProperty({
        description:'Cantidad de empleados que puede aportar este colaborador',
        example: 8
    })
    @IsNumber()
    @IsNotEmpty({message:'La cantidad de empleados que puede aportar el colaborador es obligatoria'})
    quantityWorkers : number

    @ApiProperty({
        description:'Precio por hora de los empleados',
        example: 50000
    })
    @IsNumber()
    @IsNotEmpty({message:'El precio por hora de los empleados es obligatorio'})
    valuePerHour : number

    @ApiPropertyOptional({
        description: 'Descripcion para el colaborador'
    })
    @IsOptional()
    @IsString({message: 'La descripcion debe ser texto'})
    notes?: string

}