import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { StructureResponseDto } from './structure-response.dto';

export class ProjectItemResponseDto {
  @ApiProperty({ description: 'ID de la asignación' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'ID de la estructura' })
  @Expose()
  structureId: string;

  @ApiProperty({ description: 'ID del proyecto' })
  @Expose()
  projectId: string;

  @ApiProperty({ description: 'Nombre descriptivo de la estructura (Nombre + Medida)' })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.structure) return 'Estructura no encontrada';
    return obj.structure.measure
      ? `${obj.structure.name} (${obj.structure.measure})`
      : obj.structure.name;
  })
  structureName: string;

  @ApiProperty({ description: 'Cantidad asignada' })
  @Expose()
  quantity: number;

  @ApiProperty({ description: 'Estructura asociada' })
  @Expose()
  @Type(() => StructureResponseDto)
  structure: StructureResponseDto;
}