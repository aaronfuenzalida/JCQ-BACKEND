import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsInt, Min, IsDateString, IsArray, ValidateNested, IsUUID, IsBoolean, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStructureDto } from './project-structure.dto';
import { AssignCollaboratorDto } from './assign-collaborator.dto';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Monto total del proyecto',
    example: 500000.50
  })
  @IsNumber({}, { message: 'Monto debe ser un número' })
  @Min(0, { message: 'Monto debe ser mayor o igual a 0' })
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Dirección del proyecto',
    example: 'Av. Corrientes 1234, Buenos Aires'
  })
  @IsString({ message: 'Dirección debe ser texto' })
  @IsOptional()
  locationAddress?: string;

  @ApiPropertyOptional({
    description: 'Latitud de la ubicación',
    example: -34.603722
  })
  @IsNumber({}, { message: 'Latitud debe ser un número' })
  @IsOptional()
  @Type(() => Number)
  locationLat?: number;

  @ApiPropertyOptional({
    description: 'Longitud de la ubicación',
    example: -58.381592
  })
  @IsNumber({}, { message: 'Longitud debe ser un número' })
  @IsOptional()
  @Type(() => Number)
  locationLng?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de trabajadores necesarios',
    example: 15
  })
  @IsInt({ message: 'Cantidad de trabajadores debe ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 trabajador' })
  @IsOptional()
  @Type(() => Number)
  workers?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del proyecto',
    example: '2025-01-15T10:00:00Z'
  })
  @IsDateString({}, { message: 'Fecha de inicio debe ser una fecha válida' })
  @IsOptional()
  dateInit?: string;

  @ApiPropertyOptional({
    description: 'Fecha de finalización del proyecto',
    example: '2025-03-15T10:00:00Z'
  })
  @IsDateString({}, { message: 'Fecha de finalización debe ser una fecha válida' })
  @IsOptional()
  dateEnd?: string;

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
    description: 'Lista de colaboradores asignados (para agregar nuevos o actualizar existentes)',
    type: [AssignCollaboratorDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignCollaboratorDto)
  collaborators?: AssignCollaboratorDto[];

  @ApiPropertyOptional({
    description: 'Indica si el proyecto está cotizado en dólares',
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
  @Min(0, { message: 'Valor del dólar debe ser mayor o igual a 0' })
  @IsOptional()
  usdValue?: number;

}
