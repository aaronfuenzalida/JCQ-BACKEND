import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '~/prisma';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto, ChangeProjectStatusDto, FilterProjectDto, DashboardResponseDto } from './dto';
import { PaginationQueryDto } from '~/modules/users/dto';
import { plainToInstance } from 'class-transformer';
import { createPaginationMeta, PaginatedResponseDto } from '~/common/interfaces';
import { DateTime } from 'luxon';
import { ProjectStatus } from '@prisma/client';
import { DolarService } from '~/common/services/dolar.service';
import { CreateProjectItemDto, ProjectItemResponseDto } from '~/modules/structures/dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private dolarService: DolarService,
  ) { }

  private buildWhereClause(filters: FilterProjectDto) {
    const where: any = { deletedAt: null };

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.workersMin !== undefined || filters.workersMax !== undefined) {
      where.workers = {};
      if (filters.workersMin !== undefined) {
        where.workers.gte = filters.workersMin;
      }
      if (filters.workersMax !== undefined) {
        where.workers.lte = filters.workersMax;
      }
    }

    if (filters.dateInitFrom !== undefined || filters.dateInitTo !== undefined) {
      where.dateInit = {};
      if (filters.dateInitFrom) {
        where.dateInit.gte = new Date(filters.dateInitFrom);
      }
      if (filters.dateInitTo) {
        where.dateInit.lte = new Date(filters.dateInitTo);
      }
    }

    if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
      where.amount = {};
      if (filters.amountMin !== undefined) {
        where.amount.gte = filters.amountMin;
      }
      if (filters.amountMax !== undefined) {
        where.amount.lte = filters.amountMax;
      }
    }

    return where;
  }

  async create(createProjectDto: CreateProjectDto): Promise<ProjectResponseDto> {
    // Extraemos structures, collaborators y USD del DTO para manejarlos por separado
    const { structures, collaborators, hasUSD, usdValue, ...projectData } = createProjectDto;

    const client = await this.prisma.client.findFirst({
      where: {
        id: createProjectDto.clientId,
        deletedAt: null
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const dateInit = new Date(createProjectDto.dateInit);
    const dateEnd = new Date(createProjectDto.dateEnd);

    if (dateEnd <= dateInit) {
      throw new BadRequestException('La fecha de finalización debe ser posterior a la fecha de inicio');
    }

    const rest = createProjectDto.amount;

    // Calcular monto en USD si aplica
    let amountUSD: number | null = null;
    if (hasUSD && usdValue && usdValue > 0) {
      amountUSD = createProjectDto.amount / usdValue;
    }

    return this.prisma.$transaction(async (tx) => {
      // Se crea el proyecto base sin relaciones
      const project = await tx.project.create({
        data: {
          ...projectData,
          dateInit,
          dateEnd,
          totalPaid: 0,
          rest,
          hasUSD: hasUSD || false,
          usdValue: hasUSD ? usdValue : null,
          amountUSD,
        },
        include: {
          client: true,
        },
      });

      // LOGICA DE COLABORADORES (Relacion Muchos a Muchos)
      if (collaborators && collaborators.length > 0) {
        for (const collabItem of collaborators) {
          // Buscamos al colaborador para obtener el "Snapshot" de sus datos actuales
          const collabEntity = await tx.collaborator.findUnique({
            where: { id: collabItem.collaboratorId, deletedAt: null },
          });

          if (!collabEntity) {
            throw new NotFoundException(`El colaborador seleccionado (ID: ${collabItem.collaboratorId}) no existe`);
          }

          // Creamos la relación en la tabla intermedia guardando el precio del momento
          await tx.projectCollaborator.create({
            data: {
              projectId: project.id,
              collaboratorId: collabEntity.id,
              workersCount: collabItem.workersCount,    // Cantidad de empleados asignados
              hoursCount: collabItem.hoursCount,        // Cantidad de horas necesarias
              valuePerHour: collabEntity.valuePerHour,  // SNAPSHOT: Precio pactado al momento de asignar
              totalCost: collabItem.workersCount * collabItem.hoursCount * collabEntity.valuePerHour // Costo calculado
            }
          });
        }
      }

      // LOGICA DE ESTRUCTURAS 
      if (structures && structures.length > 0) {
        for (const item of structures) {
          const structure = await tx.structure.findUnique({
            where: { id: item.structureId }
          });

          if (!structure) {
            throw new NotFoundException(`Estructura con ID ${item.structureId} no encontrada`);
          }

          if (structure.stock < item.quantity) {
            throw new BadRequestException(
              `Stock insuficiente para "${structure.name}". Solicitado: ${item.quantity}, Disponible: ${structure.stock}`
            );
          }

          // Decrementar stock
          await tx.structure.update({
            where: { id: item.structureId },
            data: { stock: { decrement: item.quantity } }
          });

          // Crear relación
          await tx.projectItem.create({
            data: {
              projectId: project.id,
              structureId: item.structureId,
              quantity: item.quantity
            }
          });
        }
      }

      // Devolvemos el proyecto re-consultando para incluir todas las nuevas relaciones
      const finalProject = await tx.project.findUnique({
        where: { id: project.id },
        include: {
          client: true,
          items: { include: { structure: true } },
          collaborators: { include: { collaborator: true } } // Incluimos los colaboradores asignados
        }
      });

      return plainToInstance(ProjectResponseDto, finalProject, { excludeExtraneousValues: true });
    });
  }

  async findAll(filters: FilterProjectDto = {}): Promise<ProjectResponseDto[]> {
    const where = this.buildWhereClause(filters);

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        client: true,
        items: {
          include: {
            structure: true // Necesitamos el nombre de la estructura
          }
        },
        collaborators: {
          include: {
            collaborator: true // Trae la info del perfil (nombre, email, etc.)
          }
        }
      },

      orderBy: { createdAt: 'desc' },
    });

    return plainToInstance(ProjectResponseDto, projects, { excludeExtraneousValues: true });
  }

  async findAllPaginated(
    paginationQuery: PaginationQueryDto,
    filters: FilterProjectDto = {}
  ): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          client: true,
          items: {
            include: {
              structure: true
            }
          },
          collaborators: {
            include: {
              collaborator: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    const data = plainToInstance(ProjectResponseDto, projects, { excludeExtraneousValues: true });
    const meta = createPaginationMeta(page, limit, total);

    return { data, meta };
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        client: true,
        paids: true,
        items: {
          include: {
            structure: true // Para tener el nombre y la medida del item
          }
        },
        collaborators: {
          include: {
            collaborator: true
          }
        }
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return plainToInstance(ProjectResponseDto, project, { excludeExtraneousValues: true });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const { structures, collaborators, hasUSD, usdValue, ...projectData } = updateProjectDto;

    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: true,
        collaborators: true // Necesitamos ver qué colaboradores ya tiene asignados
      }
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Validación de fechas
    if (projectData.dateInit || projectData.dateEnd) {
      const dateInit = projectData.dateInit ? new Date(projectData.dateInit) : project.dateInit;
      const dateEnd = projectData.dateEnd ? new Date(projectData.dateEnd) : project.dateEnd;

      if (dateEnd <= dateInit) {
        throw new BadRequestException('La fecha de finalización debe ser posterior a la fecha de inicio');
      }
    }

    // Preparar datos simples
    const dataToUpdate: any = { ...projectData };
    if (projectData.dateInit) dataToUpdate.dateInit = new Date(projectData.dateInit);
    if (projectData.dateEnd) dataToUpdate.dateEnd = new Date(projectData.dateEnd);
    if (projectData.amount !== undefined) {
      dataToUpdate.rest = projectData.amount - project.totalPaid;
    }

    // Manejar campos USD
    const finalHasUSD = hasUSD ?? project.hasUSD;
    const finalUsdValue = usdValue ?? project.usdValue;
    const finalAmount = projectData.amount ?? project.amount;

    dataToUpdate.hasUSD = finalHasUSD;
    dataToUpdate.usdValue = finalHasUSD ? finalUsdValue : null;
    dataToUpdate.amountUSD = (finalHasUSD && finalUsdValue && finalUsdValue > 0)
      ? finalAmount / finalUsdValue
      : null;

    return this.prisma.$transaction(async (tx) => {

      // 1. Actualización básica del proyecto
      await tx.project.update({
        where: { id },
        data: dataToUpdate,
      });

      // LOGICA DE COLABORADORES 
      if (collaborators) {
        // Obtenemos las asignaciones actuales de la DB
        const currentAssignments = await tx.projectCollaborator.findMany({
          where: { projectId: id },
          include: { collaborator: true }
        });

        const currentMap = new Map(currentAssignments.map(c => [c.collaboratorId, c]));
        const incomingIds = new Set(collaborators.map(c => c.collaboratorId));

        for (const item of collaborators) {
          const existing = currentMap.get(item.collaboratorId);

          if (existing) {
            // CASO A: ACTUALIZAR EXISTENTE
            // Si el colaborador ya estaba asignado, solo actualizamos las cantidades (horas/personal).
            // IMPORTANTE: Mantener el 'valuePerHour' original 
            const newTotalCost = item.workersCount * item.hoursCount * existing.valuePerHour;

            await tx.projectCollaborator.update({
              where: { id: existing.id }, // Usamos el ID de la tabla intermedia
              data: {
                workersCount: item.workersCount,
                hoursCount: item.hoursCount,
                totalCost: newTotalCost // Recalculamos el costo total con el precio histórico
              }
            });
          } else {
            // CASO B: NUEVA ASIGNACIÓN
            // El colaborador no estaba en este proyecto, lo agregamos.
            const collabInfo = await tx.collaborator.findUnique({
              where: { id: item.collaboratorId }
            });

            if (!collabInfo) throw new NotFoundException(`Colaborador ${item.collaboratorId} no existe`);

            // tomar el precio ACTUAL como nuevo Snapshot
            await tx.projectCollaborator.create({
              data: {
                projectId: id,
                collaboratorId: item.collaboratorId,
                workersCount: item.workersCount,
                hoursCount: item.hoursCount,
                valuePerHour: collabInfo.valuePerHour,
                totalCost: item.workersCount * item.hoursCount * collabInfo.valuePerHour
              }
            });
          }
        }

        // CASO C: ELIMINACIÓN
        // Si había colaboradores asignados que NO vienen en el nuevo array, se eliminan del proyecto.
        for (const [collabId, record] of currentMap) {
          if (!incomingIds.has(collabId)) {
            await tx.projectCollaborator.delete({
              where: { id: record.id }
            });
          }
        }
      }

      // LOGICA DE ESTRUCTURAS (Manejo de Stock)
      if (structures) {
        const currentItemsMap = new Map(project.items.map(i => [i.structureId, i.quantity]));
        const incomingStructureIds = new Set(structures.map(s => s.structureId));

        for (const newItem of structures) {
          const currentQty = currentItemsMap.get(newItem.structureId) || 0;
          const difference = newItem.quantity - currentQty;

          if (difference !== 0) {
            const structure = await tx.structure.findUnique({ where: { id: newItem.structureId } });

            if (!structure) throw new NotFoundException(`Estructura ${newItem.structureId} no encontrada`);

            if (difference > 0 && structure.stock < difference) {
              throw new BadRequestException(
                `Stock insuficiente para "${structure.name}". Necesitas ${difference} más, pero solo hay ${structure.stock}.`
              );
            }

            // Actualizar Stock
            await tx.structure.update({
              where: { id: newItem.structureId },
              data: { stock: { decrement: difference } }
            });

            // Actualizar/Crear Relacion
            await tx.projectItem.upsert({
              where: { projectId_structureId: { projectId: id, structureId: newItem.structureId } },
              update: { quantity: newItem.quantity },
              create: {
                projectId: id,
                structureId: newItem.structureId,
                quantity: newItem.quantity
              }
            });
          }
        }

        // Procesar eliminaciones de estructuras
        for (const [structureId, quantity] of currentItemsMap) {
          if (!incomingStructureIds.has(structureId)) {
            // Devolver stock
            await tx.structure.update({
              where: { id: structureId },
              data: { stock: { increment: quantity } }
            });

            // Borrar relación
            await tx.projectItem.delete({
              where: { projectId_structureId: { projectId: id, structureId } }
            });
          }
        }
      }

      // Devolver proyecto actualizado con todas las relaciones
      const updatedProject = await tx.project.findUnique({
        where: { id },
        include: {
          client: true,
          items: {
            include: { structure: true }
          },
          collaborators: {
            include: { collaborator: true }
          }
        },
      });

      return plainToInstance(ProjectResponseDto, updatedProject, { excludeExtraneousValues: true });
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Soft delete
    await this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate(),
      },
    });

    return { message: 'Proyecto eliminado exitosamente' };
  }

  // Método auxiliar para recalcular totales cuando se agrega un pago
  async recalculateTotals(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { paids: { where: { deletedAt: null } } },
    });

    if (!project) return;

    const totalPaid = project.paids.reduce((sum, paid) => sum + paid.amount, 0);
    const rest = project.amount - totalPaid;

    await this.prisma.project.update({
      where: { id: projectId },
      data: { totalPaid, rest },
    });
  }

  // Validar transición de estado
  private validateStatusTransition(currentStatus: ProjectStatus, newStatus: ProjectStatus): void {
    // Mapeo de transiciones válidas
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      [ProjectStatus.BUDGET]: [ProjectStatus.ACTIVE],
      [ProjectStatus.ACTIVE]: [ProjectStatus.IN_PROCESS, ProjectStatus.DELETED],
      [ProjectStatus.IN_PROCESS]: [ProjectStatus.FINISHED, ProjectStatus.DELETED],
      [ProjectStatus.FINISHED]: [], // No puede cambiar
      [ProjectStatus.DELETED]: [ProjectStatus.ACTIVE], // Se puede restaurar
    };

    // Si ya está en el mismo estado, no hacer nada
    if (currentStatus === newStatus) {
      throw new BadRequestException('El proyecto ya se encuentra en ese estado');
    }

    // Validar si la transición es válida
    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar de ${currentStatus} a ${newStatus}. Transiciones válidas desde ${currentStatus}: ${validTransitions[currentStatus].join(', ') || 'ninguna'}`
      );
    }
  }

  // Cambiar estado del proyecto
  async changeStatus(id: string, changeStatusDto: ChangeProjectStatusDto): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: { client: true },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Validar transición de estado
    this.validateStatusTransition(project.status, changeStatusDto.status);

    const dataToUpdate: any = {
      status: changeStatusDto.status,
    };

    // Si se está activando el proyecto (desde BUDGET o DELETED), obtener precio del dólar
    if (
      changeStatusDto.status === ProjectStatus.ACTIVE &&
      (project.status === ProjectStatus.BUDGET || project.status === ProjectStatus.DELETED)
    ) {
      try {
        const dolarPrice = await this.dolarService.getDolarBluePrice();
        dataToUpdate.usdPrice = dolarPrice;
      } catch (error) {
        throw new BadRequestException(
          'No se pudo obtener el precio del dólar. Intente nuevamente en unos momentos.'
        );
      }
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: dataToUpdate,
      include: { client: true },
    });

    return plainToInstance(ProjectResponseDto, updatedProject, { excludeExtraneousValues: true });
  }

  async getDashboard(): Promise<DashboardResponseDto> {
    // Obtener estadísticas en paralelo
    const [activeProjectsCount, totalClientsCount, projectsForStats, recentProjects] = await Promise.all([
      // Total de proyectos activos
      this.prisma.project.count({
        where: {
          status: ProjectStatus.ACTIVE,
          deletedAt: null,
        },
      }),

      // Total de clientes
      this.prisma.client.count({
        where: { deletedAt: null },
      }),

      // Proyectos para calcular totales (solo activos)
      this.prisma.project.findMany({
        where: {
          status: ProjectStatus.ACTIVE,
          deletedAt: null,
        },
        select: {
          totalPaid: true,
          rest: true,
        },
      }),

      // Últimos 5 proyectos recientes (ordenados por fecha de creación)
      this.prisma.project.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          totalPaid: true,
          locationAddress: true,
          client: {
            select: {
              fullname: true,
            },
          },
        },
      }),
    ]);

    // Calcular total cobrado y pendiente
    const totalCollected = projectsForStats.reduce((sum, project) => sum + project.totalPaid, 0);
    const totalPending = projectsForStats.reduce((sum, project) => sum + project.rest, 0);

    // Mapear proyectos recientes
    const recentProjectsFormatted = recentProjects.map(project => ({
      id: project.id,
      clientName: project.client.fullname,
      locationAddress: project.locationAddress || 'Sin dirección',
      amount: project.amount,
      totalPaid: project.totalPaid,
    }));

    return plainToInstance(
      DashboardResponseDto,
      {
        stats: {
          activeProjects: activeProjectsCount,
          totalClients: totalClientsCount,
          totalCollected,
          totalPending,
        },
        recentProjects: recentProjectsFormatted,
      },
      { excludeExtraneousValues: true },
    );
  }

  async addStructure(projectId: string, createDto: CreateProjectItemDto): Promise<ProjectItemResponseDto> {
    const { structureId, quantity } = createDto;

    return this.prisma.$transaction(async (tx) => {
      const structure = await tx.structure.findUnique({ where: { id: structureId } });
      if (!structure) throw new NotFoundException('Estructura no encontrada');

      const existingItem = await tx.projectItem.findUnique({
        where: { projectId_structureId: { projectId, structureId } },
      });

      const currentQty = existingItem ? existingItem.quantity : 0;
      const stockNeeded = quantity - currentQty;

      if (stockNeeded > 0 && structure.stock < stockNeeded) {
        throw new BadRequestException(
          `Stock insuficiente. Disponibles: ${structure.stock}, Necesarios extra: ${stockNeeded}`
        );
      }

      await tx.structure.update({
        where: { id: structureId },
        data: { stock: { decrement: stockNeeded } },
      });

      const item = await tx.projectItem.upsert({
        where: { projectId_structureId: { projectId, structureId } },
        update: { quantity: quantity },
        create: { projectId, structureId, quantity },
        include: { structure: { include: { category: true } } },
      });

      return {
        id: item.id,
        quantity: item.quantity,
        projectId: item.projectId,
        structureId: item.structureId,
        structureName: item.structure.measure
          ? `${item.structure.name} (${item.structure.measure})`
          : item.structure.name,
        structure: {
          ...item.structure,
          measure: item.structure.measure || undefined,
          description: item.structure.description || undefined,
          category: {
            ...item.structure.category,
            description: item.structure.category.description || undefined,
            deletedAt: item.structure.category.deletedAt || undefined
          },
          inUse: 0,
          available: item.structure.stock
        },
      };
    });
  }

  async findProjectItems(id: string): Promise<ProjectItemResponseDto[]> {
    const items = await this.prisma.projectItem.findMany({
      where: { projectId: id },
      include: { structure: { include: { category: true } } },
    })

    return items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      projectId: item.projectId,
      structureId: item.structureId,
      structureName: item.structure.measure
        ? `${item.structure.name} (${item.structure.measure})`
        : item.structure.name,
      structure: {
        ...item.structure,
        measure: item.structure.measure || undefined,
        description: item.structure.description || undefined,
        category: {
          ...item.structure.category,
          description: item.structure.category.description || undefined,
          deletedAt: item.structure.category.deletedAt || undefined
        },
        inUse: 0,
        available: item.structure.stock
      },
    }));
  }

  async updateProjectItem(projectId: string, structureId: string, newQuantity: number): Promise<ProjectItemResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const currentItem = await tx.projectItem.findUnique({
        where: { projectId_structureId: { projectId, structureId } },
        include: { structure: { include: { category: true } } }
      });

      if (!currentItem) throw new NotFoundException('El ítem no existe en este proyecto');

      const difference = newQuantity - currentItem.quantity;
      if (difference > 0 && currentItem.structure.stock < difference) {
        throw new BadRequestException(`Stock insuficiente. Solo hay ${currentItem.structure.stock} disponibles.`);
      }

      await tx.structure.update({
        where: { id: structureId },
        data: { stock: { decrement: difference } },
      });

      const updatedItem = await tx.projectItem.update({
        where: { projectId_structureId: { projectId, structureId } },
        data: { quantity: newQuantity },
        include: { structure: { include: { category: true } } },
      });

      return {
        id: updatedItem.id,
        quantity: updatedItem.quantity,
        projectId: updatedItem.projectId,
        structureId: updatedItem.structureId,
        structureName: updatedItem.structure.measure
          ? `${updatedItem.structure.name} (${updatedItem.structure.measure})`
          : updatedItem.structure.name,
        structure: {
          ...updatedItem.structure,
          measure: updatedItem.structure.measure || undefined,
          description: updatedItem.structure.description || undefined,
          category: {
            ...updatedItem.structure.category,
            description: updatedItem.structure.category.description || undefined,
            deletedAt: updatedItem.structure.category.deletedAt || undefined
          },
          inUse: 0,
          available: updatedItem.structure.stock
        },
      };
    });
  }

  async removeProjectItem(projectId: string, structureId: string): Promise<{ message: string }> {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.projectItem.findUnique({
        where: { projectId_structureId: { projectId, structureId } },
      });

      if (!item) throw new NotFoundException('El ítem no existe');

      await tx.structure.update({
        where: { id: structureId },
        data: { stock: { increment: item.quantity } },
      });

      await tx.projectItem.delete({
        where: { projectId_structureId: { projectId, structureId } },
      });

      return { message: 'Ítem eliminado y stock restaurado correctamente' };
    });
  }

}
