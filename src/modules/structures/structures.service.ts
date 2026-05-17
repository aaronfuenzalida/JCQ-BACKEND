import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateStructureDto,
  StructureResponseDto,
  UpdateStructureDto,
  FilterStructureDto,
  CreateStructureCategoryDto,
  StructureCategoryResponseDto,
  UpdateStructureCategoryDto,
  FilterStructureCategoryDto
} from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { DateTime } from 'luxon';
import { ProjectStatus } from '@prisma/client';
import { PaginationQueryDto } from '~/modules/users/dto';
import { createPaginationMeta, PaginatedResponseDto } from '~/common/interfaces';

@Injectable()
export class StructuresService {
  constructor(private readonly prisma: PrismaService) { }

  // STRUCTURE CATEGORY METHODS

  private buildWhereClauseCategory(filters: FilterStructureCategoryDto) {
    const where: any = { deletedAt: null };
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    return where;
  }

  async createCategory(dto: CreateStructureCategoryDto): Promise<StructureCategoryResponseDto> {
    if (!dto.name) {
      throw new BadRequestException('El nombre de la categoría es obligatorio');
    }

    // Check for duplicate category name (case-insensitive)
    const existingCategory = await this.prisma.structureCategory.findFirst({
      where: {
        name: { equals: dto.name, mode: 'insensitive' },
        deletedAt: null
      }
    });
    if (existingCategory) {
      throw new BadRequestException(`Ya existe una categoría con el nombre "${dto.name}"`);
    }

    const category = await this.prisma.structureCategory.create({
      data: dto
    });
    return plainToInstance(StructureCategoryResponseDto, category, { excludeExtraneousValues: true });
  }

  async getAllCategories(filters: FilterStructureCategoryDto = {}): Promise<StructureCategoryResponseDto[]> {
    const where = this.buildWhereClauseCategory(filters);
    const categories = await this.prisma.structureCategory.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    return plainToInstance(StructureCategoryResponseDto, categories, { excludeExtraneousValues: true });
  }

  async getCategoryById(id: string): Promise<StructureCategoryResponseDto> {
    const category = await this.prisma.structureCategory.findUnique({
      where: { id, deletedAt: null }
    });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return plainToInstance(StructureCategoryResponseDto, category, { excludeExtraneousValues: true });
  }

  async updateCategory(id: string, data: UpdateStructureCategoryDto): Promise<StructureCategoryResponseDto> {
    const existing = await this.prisma.structureCategory.findUnique({
      where: { id, deletedAt: null }
    });
    if (!existing) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    // Check for duplicate category name if name is being updated (case-insensitive)
    if (data.name) {
      const duplicateCategory = await this.prisma.structureCategory.findFirst({
        where: {
          name: { equals: data.name, mode: 'insensitive' },
          id: { not: id },
          deletedAt: null
        }
      });
      if (duplicateCategory) {
        throw new BadRequestException(`Ya existe una categoría con el nombre "${data.name}"`);
      }
    }

    const updated = await this.prisma.structureCategory.update({
      where: { id },
      data
    });
    return plainToInstance(StructureCategoryResponseDto, updated, { excludeExtraneousValues: true });
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const category = await this.prisma.structureCategory.findUnique({
      where: { id, deletedAt: null }
    });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    // Check if there are structures using this category
    const structuresCount = await this.prisma.structure.count({
      where: { categoryId: id, deletedAt: null }
    });
    if (structuresCount > 0) {
      throw new BadRequestException(`No se puede eliminar la categoría porque tiene ${structuresCount} estructura(s) asociada(s)`);
    }

    await this.prisma.structureCategory.update({
      where: { id },
      data: {
        deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate(),
      },
    });
    return { message: 'Categoría eliminada exitosamente' };
  }

  // STRUCTURE METHODS

  private buildWhereClause(filters: FilterStructureDto) {
    const where: any = { deletedAt: null };
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    return where;
  }



  async createStructure(createStructureDto: CreateStructureDto) {
    if (!createStructureDto.categoryId) {
      throw new BadRequestException('La categoría es obligatoria');
    }

    // Verify category exists
    const category = await this.prisma.structureCategory.findUnique({
      where: { id: createStructureDto.categoryId, deletedAt: null }
    });
    if (!category) {
      throw new BadRequestException('La categoría especificada no existe');
    }

    // Check for duplicate structure with same name AND measure (case-insensitive name)
    const existingStructure = await this.prisma.structure.findFirst({
      where: {
        name: { equals: createStructureDto.name, mode: 'insensitive' },
        measure: createStructureDto.measure || null,
        deletedAt: null
      }
    });
    if (existingStructure) {
      const measureText = createStructureDto.measure ? ` y medida "${createStructureDto.measure}"` : '';
      throw new BadRequestException(`Ya existe una estructura con el nombre "${createStructureDto.name}"${measureText}`);
    }

    const structure = await this.prisma.structure.create({
      data: createStructureDto,
      include: { category: true }
    });
    return this.mapToResponse(structure, 0);
  }

  async getAllStructures(filters: FilterStructureDto = {}): Promise<StructureResponseDto[]> {
    const where = this.buildWhereClause(filters);

    const structures = await this.prisma.structure.findMany({
      where,
      include: {
        category: true,
        items: {
          where: {
            project: {
              status: { in: [ProjectStatus.ACTIVE, ProjectStatus.IN_PROCESS] }
            }
          },
          select: { quantity: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    return structures.map(structure => {
      const inUse = structure.items.reduce((acc, item) => acc + item.quantity, 0);
      return this.mapToResponse(structure, inUse);
    });
  }

  async findAllPaginated(paginationQuery: PaginationQueryDto, filters: FilterStructureDto = {}): Promise<PaginatedResponseDto<StructureResponseDto>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const [structures, total] = await Promise.all([
      this.prisma.structure.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          items: {
            where: {
              project: {
                status: { in: [ProjectStatus.ACTIVE, ProjectStatus.IN_PROCESS] }
              }
            },
            select: { quantity: true }
          }
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.structure.count({ where }),
    ]);

    const data = structures.map(structure => {
      const inUse = structure.items.reduce((acc, item) => acc + item.quantity, 0);
      return this.mapToResponse(structure, inUse);
    });

    const meta = createPaginationMeta(page, limit, total);

    return { data, meta };
  }


  async getStructureById(id: string): Promise<StructureResponseDto> {
    const structure = await this.prisma.structure.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        items: {
          where: {
            project: {
              status: { in: [ProjectStatus.ACTIVE, ProjectStatus.IN_PROCESS] }
            }
          },
          select: { quantity: true }
        }
      }
    });

    if (!structure) {
      throw new NotFoundException(`Estructura con ID ${id} no encontrada`);
    }

    const inUse = structure.items.reduce((acc, item) => acc + item.quantity, 0);
    return this.mapToResponse(structure, inUse);
  }

  async findUsage(id: string) {
    const usages = await this.prisma.projectItem.findMany({
      where: {
        structureId: id,
        project: {
          status: { in: [ProjectStatus.ACTIVE, ProjectStatus.IN_PROCESS] }
        }
      },
      include: {
        project: {
          include: { client: true }
        }
      },
      orderBy: { project: { dateEnd: 'asc' } }
    });

    return usages.map(item => ({
      projectId: item.projectId,
      projectName: item.project.event || "Sin nombre de evento",
      clientName: item.project.client.fullname,
      status: item.project.status,
      quantity: item.quantity,
      dateEnd: item.project.dateEnd
    }));
  }

  async updateStructure(id: string, data: UpdateStructureDto): Promise<StructureResponseDto> {
    const existingStructure = await this.prisma.structure.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingStructure) {
      throw new NotFoundException(`Estructura con ID ${id} no encontrada`);
    }

    // If updating categoryId, verify the new category exists
    if (data.categoryId) {
      const category = await this.prisma.structureCategory.findUnique({
        where: { id: data.categoryId, deletedAt: null }
      });
      if (!category) {
        throw new BadRequestException('La categoría especificada no existe');
      }
    }

    // Check for duplicate structure with same name AND measure if name or measure is being updated
    if (data.name || data.measure !== undefined) {
      const newName = data.name || existingStructure.name;
      const newMeasure = data.measure !== undefined ? (data.measure || null) : existingStructure.measure;

      const duplicateStructure = await this.prisma.structure.findFirst({
        where: {
          name: { equals: newName, mode: 'insensitive' },
          measure: newMeasure,
          id: { not: id },
          deletedAt: null
        }
      });
      if (duplicateStructure) {
        const measureText = newMeasure ? ` y medida "${newMeasure}"` : '';
        throw new BadRequestException(`Ya existe una estructura con el nombre "${newName}"${measureText}`);
      }
    }

    const updatedStructure = await this.prisma.structure.update({
      where: { id },
      data: data,
      include: {
        category: true,
        items: {
          where: {
            project: { status: { in: [ProjectStatus.ACTIVE, ProjectStatus.IN_PROCESS] } }
          }
        }
      }
    });

    const inUse = updatedStructure.items ? updatedStructure.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
    return this.mapToResponse(updatedStructure, inUse);
  }

  async deleteStructure(id: string): Promise<{ message: string }> {
    const structure = await this.prisma.structure.findUnique({
      where: { id, deletedAt: null },
    });
    if (!structure) {
      throw new NotFoundException(`Estructura con ID ${id} no encontrada`);
    }
    await this.prisma.structure.update({
      where: { id },
      data: {
        deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate(),
      },
    });
    return { message: 'Estructura eliminada exitosamente' };
  }

  private mapToResponse(structure: any, inUse: number): StructureResponseDto {
    const response = plainToInstance(StructureResponseDto, structure, { excludeExtraneousValues: true });

    response.available = structure.stock;
    response.inUse = inUse;

    response.stock = structure.stock + inUse;

    return response;
  }
}