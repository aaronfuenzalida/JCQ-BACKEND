import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '~/prisma';
import {
    CreateDispatchDTO,
    DispatchResponseDTO,
    UpdateDispatchDTO,
    FilterDispatchDTO,
    CreateDispatchItemDTO,
    UpdateDispatchItemDTO,
    DispatchItemResponseDTO
} from './dto';
import { plainToInstance } from 'class-transformer';
import { DateTime } from 'luxon';
import { PaginationQueryDto } from '~/modules/users/dto';
import { createPaginationMeta, PaginatedResponseDto } from '~/common/interfaces';

@Injectable()
export class DispatchService {
    constructor(private readonly prisma: PrismaService) { }

    private buildWhereClause(filters: FilterDispatchDTO) {
        const where: any = { deletedAt: null };

        if (filters.projectId) {
            where.projectId = filters.projectId;
        }

        if (filters.dateInit || filters.dateEnd) {
            where.createdAt = {};
            if (filters.dateInit) {
                where.createdAt.gte = new Date(filters.dateInit);
            }
            if (filters.dateEnd) {
                where.createdAt.lte = new Date(filters.dateEnd);
            }
        }

        if (filters.driverCuit) {
            where.cuit = filters.driverCuit;
        }
        if (filters.licensePlate) {
            where.licensePlate = filters.licensePlate;
        }
        if (filters.clientName) {
            where.project = {
                client: {
                    fullname: { contains: filters.clientName, mode: 'insensitive' }
                }
            };
        }

        return where;
    }

    //Dispatch Methods

    async createDispatch(createDispatchDTO: CreateDispatchDTO): Promise<DispatchResponseDTO> {
        if (!createDispatchDTO.cuit && !createDispatchDTO.licensePlate) {
            throw new BadRequestException('Debe proporcionar CUIT o Patente del conductor');
        }

        const { items, ...dispatchData } = createDispatchDTO;

        // Use transaction to ensure both dispatch creation and quantity updates succeed together
        const dispatch = await this.prisma.$transaction(async (tx) => {
            // Create the dispatch with its items
            const newDispatch = await tx.dispatch.create({
                data: {
                    ...dispatchData,
                    items: {
                        create: items.map((item) => ({
                            quantity: item.quantity,
                            projectItemId: item.projectItemId,
                        })),
                    },
                },
                include: {
                    project: { include: { client: true } },
                    items: {
                        include: { projectItem: { include: { structure: true } } }
                    },
                }
            });

            // Update dispatchedQuantity for each ProjectItem
            for (const item of items) {
                await tx.projectItem.update({
                    where: { id: item.projectItemId },
                    data: {
                        dispatchedQuantity: { increment: item.quantity }
                    }
                });
            }

            return newDispatch;
        });

        return plainToInstance(DispatchResponseDTO, dispatch, { excludeExtraneousValues: true });
    }

    async updateDispatch(id: string, data: UpdateDispatchDTO): Promise<DispatchResponseDTO> {
        const dispatch = await this.prisma.dispatch.findFirst({
            where: { id, deletedAt: null }
        });

        if (!dispatch) {
            throw new NotFoundException(`Despacho con id ${id} no encontrado`);
        }

        const { items, ...rest } = data;

        const updatedDispatch = await this.prisma.dispatch.update({
            where: { id },
            data: {
                ...rest,
                ...(items && {
                    items: {
                        deleteMany: {},
                        create: items.map((item) => ({
                            quantity: item.quantity,
                            projectItemId: item.projectItemId,
                        })),
                    },
                }),
            },
            include: {
                project: { include: { client: true } },
                items: {
                    include: { projectItem: { include: { structure: true } } }
                },
            }
        });

        return plainToInstance(DispatchResponseDTO, updatedDispatch, { excludeExtraneousValues: true });
    }

    async getAllDispatches(filters: FilterDispatchDTO = {}): Promise<DispatchResponseDTO[]> {
        const where = this.buildWhereClause(filters);

        const dispatches = await this.prisma.dispatch.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                project: { include: { client: true } },
                items: {
                    include: { projectItem: { include: { structure: true } } }
                },
            },
        });

        return plainToInstance(DispatchResponseDTO, dispatches, { excludeExtraneousValues: true });
    }

    async getAllDispatchesPaginated(
        paginationQuery: PaginationQueryDto,
        filters: FilterDispatchDTO = {}
    ): Promise<PaginatedResponseDto<DispatchResponseDTO>> {
        const { page = 1, limit = 10 } = paginationQuery;
        const skip = (page - 1) * limit;
        const where = this.buildWhereClause(filters);

        const [dispatches, total] = await Promise.all([
            this.prisma.dispatch.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    project: { include: { client: true } },
                    items: {
                        include: { projectItem: { include: { structure: true } } }
                    },
                },
            }),
            this.prisma.dispatch.count({ where }),
        ]);

        const data = plainToInstance(DispatchResponseDTO, dispatches, { excludeExtraneousValues: true });
        const meta = createPaginationMeta(page, limit, total);

        return { data, meta };
    }

    async deleteDispatch(id: string): Promise<{ message: string }> {
        const dispatch = await this.prisma.dispatch.findUnique({
            where: { id, deletedAt: null },
            include: { items: true } // Include items to get quantities
        });

        if (!dispatch) {
            throw new NotFoundException(`Despacho con id ${id} no encontrado`);
        }

        // Use transaction for consistency
        await this.prisma.$transaction(async (tx) => {
            // 1. Decrement dispatchedQuantity for each item
            for (const item of dispatch.items) {
                await tx.projectItem.update({
                    where: { id: item.projectItemId },
                    data: {
                        dispatchedQuantity: { decrement: item.quantity }
                    }
                });
            }

            // 2. Soft delete items
            await tx.dispatchItem.updateMany({
                where: { dispatchId: id, deletedAt: null },
                data: { deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate() }
            });

            // 3. Soft delete dispatch
            await tx.dispatch.update({
                where: { id: id },
                data: {
                    deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate(),
                },
            });
        });

        return { message: 'Despacho eliminado correctamente' };
    }

    //DispatchItems Methods

    async createDispatchItem(dispatchId: string, createDispatchItemDTO: CreateDispatchItemDTO): Promise<DispatchItemResponseDTO> {
        if (!createDispatchItemDTO.projectItemId && !createDispatchItemDTO.quantity) {
            throw new BadRequestException('Debe proporcionar las estructuras y la cantidad')
        }

        // Verificar que el dispatch existe
        const dispatch = await this.prisma.dispatch.findFirst({
            where: { id: dispatchId, deletedAt: null }
        });

        if (!dispatch) {
            throw new NotFoundException(`Despacho con id ${dispatchId} no encontrado`);
        }

        const dispatchItem = await this.prisma.dispatchItem.create({
            data: {
                ...createDispatchItemDTO,
                dispatchId,
            },
            include: { projectItem: { include: { structure: true } } }
        });

        return plainToInstance(DispatchItemResponseDTO, dispatchItem, { excludeExtraneousValues: true });
    }

    async updateDispatchItem(id: string, data: UpdateDispatchItemDTO): Promise<DispatchItemResponseDTO> {
        const dispatchItem = await this.prisma.dispatchItem.findFirst({
            where: { id, deletedAt: null }
        })

        if (!dispatchItem) {
            throw new NotFoundException(`Item de despacho con id ${id} no encontrado`)
        }

        const updatedDispatchItem = await this.prisma.dispatchItem.update({
            where: { id },
            data,
        })

        return plainToInstance(DispatchItemResponseDTO, updatedDispatchItem, { excludeExtraneousValues: true })
    }

    async getAllDispatchItems(dispatchId: string): Promise<DispatchItemResponseDTO[]> {
        const dispatchItems = await this.prisma.dispatchItem.findMany({
            where: { dispatchId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: { projectItem: { include: { structure: true } } }
        })

        return plainToInstance(DispatchItemResponseDTO, dispatchItems, { excludeExtraneousValues: true })
    }

    private async deleteAllDispatchItems(dispatchId: string) {
        await this.prisma.dispatchItem.updateMany({
            where: { dispatchId, deletedAt: null },
            data: { deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate() }
        });
    }

    async deleteDispatchItem(id: string): Promise<{ message: string }> {
        const dispatchItem = await this.prisma.dispatchItem.findUnique({
            where: { id, deletedAt: null }
        })

        if (!dispatchItem) {
            throw new NotFoundException(`Item de despacho con id ${id} no encontrado`)
        }

        await this.prisma.dispatchItem.update({
            where: { id: id },
            data: {
                deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate(),
            },
        });

        return { message: 'Item de despacho eliminado correctamente' }
    }

}

