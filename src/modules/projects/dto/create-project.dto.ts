import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, IsOptional, IsInt, Min, IsDateString, IsArray, ValidateNested, IsBoolean, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStructureDto } from './project-structure.dto';
import { AssignCollaboratorDto } from './assign-collaborator.dto';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Monto total del proyecto',
    example: 500000.50
  })
  @IsNumber({}, { message: 'Monto debe ser un número' })
  @Min(0, { message: 'Monto debe ser mayor o igual a 0' })
  @IsNotEmpty({ message: 'Monto es requerido' })
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'ID del cliente',
    example: 'uuid-del-cliente'
  })
  @IsUUID('4', { message: 'ID de cliente inválido' })
  @IsNotEmpty({ message: 'Cliente es requerido' })
  clientId: string;

  @ApiPropertyOptional({
    description: 'Dirección del proyecto',
    example: 'Av. Corrientes 1234, Buenos Aires'
  })
  @IsString({ message: 'Dirección debe ser texto' })
  @IsOptional()
  locationAddress?: string;

  @ApiPropertyOptional({
    description: 'Latitud de la ubicación (para Google Maps/Leaflet)',
    example: -34.603722
  })
  @IsNumber({}, { message: 'Latitud debe ser un número' })
  @IsOptional()
  @Type(() => Number)
  locationLat?: number;

  @ApiPropertyOptional({
    description: 'Longitud de la ubicación (para Google Maps/Leaflet)',
    example: -58.381592
  })
  @IsNumber({}, { message: 'Longitud debe ser un número' })
  @IsOptional()
  @Type(() => Number)
  locationLng?: number;

  @ApiProperty({
    description: 'Cantidad de trabajadores necesarios',
    example: 15
  })
  @IsInt({ message: 'Cantidad de trabajadores debe ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 trabajador' })
  @IsNotEmpty({ message: 'Cantidad de trabajadores es requerida' })
  @Type(() => Number)
  workers: number;

  @ApiProperty({
    description: 'Fecha de inicio del proyecto',
    example: '2025-01-15T10:00:00Z'
  })
  @IsDateString({}, { message: 'Fecha de inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'Fecha de inicio es requerida' })
  dateInit: string;

  @ApiProperty({
    description: 'Fecha de finalización del proyecto',
    example: '2025-03-15T10:00:00Z'
  })
  @IsDateString({}, { message: 'Fecha de finalización debe ser una fecha válida' })
  @IsNotEmpty({ message: 'Fecha de finalización es requerida' })
  dateEnd: string;

  @ApiPropertyOptional({
    description: 'Evento relacionado al proyecto',
    example: 'Construcción de edificio residencial'
  })
  @IsString({ message: 'Evento debe ser texto' })
  @IsOptional()
  event?: string;

  @ApiPropertyOptional({ type: [ProjectStructureDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectStructureDto)
  structures?: ProjectStructureDto[];

  @ApiPropertyOptional({
    type: [AssignCollaboratorDto],
    description: 'Lista de colaboradores asignados al proyecto'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignCollaboratorDto)
  collaborators?: AssignCollaboratorDto[];

  @ApiProperty({
    description: 'Indica si el proyecto está cotizado en dólares',
    example: false,
    default: false
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
  @Min(0, { message: 'Valor del dólar debe ser mayor o igual a 0' })
  usdValue?: number;

}
