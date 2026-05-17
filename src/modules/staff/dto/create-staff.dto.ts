import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateIf} from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ 
    description: 'Nombre del personal',
    example: 'Juan '
      })
  @IsNotEmpty({message: 'El nombre es obligatorio'})
  @IsString({message: 'El nombre debe ser texto'})
  firstName: string; 
  
  @ApiProperty({ 
    description: 'Apellido del personal',
    example: 'Martinez'
      })
  @IsNotEmpty(({message: 'El apellido es obligatorio'}))
  @IsString({message: 'El nombre debe ser texto'})
  lastName: string; 

  @ApiPropertyOptional({ 
      description: 'CUIT del personal (solo números o string, sin formato)',
      example: '20123456789'
    })
  @IsString({ message: 'CUIT debe ser texto' })
  @ValidateIf((o) => !o.dni)
  @IsNotEmpty({ message: 'Debe proporcionar CUIT o DNI' })
  @IsOptional()
  cuit?: string;

  @ApiPropertyOptional({ 
    description: 'DNI del personal(solo números o string)',
    example: '12345678'
  })
  @IsString({ message: 'DNI debe ser texto' })
  @ValidateIf((o) => !o.cuit)
  @IsNotEmpty({ message: 'Debe proporcionar CUIT o DNI' })
  @IsOptional()
  dni?: string;

  @ApiProperty({
    description: 'Categoría del personal',
    example: 'A (Administrativo)'
  })
  @IsNotEmpty({message: 'La categoria es obligatoria'})
  @IsString({message: 'La categoria debe ser texto'})
  category: string;
  
  @ApiPropertyOptional({
    description: 'Numero de telefono',
    example: '11-0123-4567'
  })
  @IsString({message: 'El numero de telefono debe ser texto'})
  numberPhone: string;
  
  @ApiPropertyOptional({
    description: 'Direccion del empleado',
    example: 'Avenida Rivadavia 123'
  })
  @IsString({message: 'La direccion debe ser texto '})
  adress: string;
  
  @ApiPropertyOptional({
    description: 'Mail del empleado',
    example: 'juanPerez451@gmail.com'
  })
  @IsString({message: 'La direccion de mail debe ser texto '})
  email: string;
  
  @ApiPropertyOptional({
    description: 'Antiguedad del empleado',
    example: '4 Años'
  })
  @IsString({message: 'La antiguedad debe ser texto'})
  seniority: string;   
}