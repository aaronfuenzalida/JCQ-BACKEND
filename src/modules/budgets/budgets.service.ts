import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '~/prisma';
import { CreateBudgetDto, BudgetResponseDto, FilterBudgetDto, UpdateBudgetDto } from './dto';
import { PaginationQueryDto } from '~/modules/users/dto';
import { plainToInstance } from 'class-transformer';
import { createPaginationMeta, PaginatedResponseDto } from '~/common/interfaces';
import { DateTime } from 'luxon';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) { }

  private buildWhereClause(filters: FilterBudgetDto) {
    const where: any = { deletedAt: null };

    // Cliente de la DB 
    if (filters.clientName) {
      where.client = {
        fullname: { contains: filters.clientName, mode: 'insensitive' },
      };
    }

    // Cliente Manual
    if (filters.manualClientName) {
      where.manualClientName = {
        contains: filters.manualClientName,
        mode: 'insensitive',
      };
    }

    // Rango de fechas
    if (filters.startDate || filters.endDate) {
      where.date = {};

      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }

      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    return where;
  }

  async createBudget(createBudgetDto: CreateBudgetDto): Promise<BudgetResponseDto> {
    if (!createBudgetDto.clientId && !createBudgetDto.manualClientName) {
      throw new BadRequestException('Debe proporcionar un cliente existente o de manera manual');
    }

    const {
      netAmount,
      hasIva,
      ivaPercentage,
      hasIibb,
      iibbPercentage,
      hasUSD,
      usdValue,
      items,
      descriptionItems,
      ...restData
    } = createBudgetDto;

    let ivaValue = 0;
    if (hasIva && ivaPercentage) {
      ivaValue = netAmount * (ivaPercentage / 100);
    }

    let iibbValue = 0;
    if (hasIibb && iibbPercentage) {
      iibbValue = netAmount * (iibbPercentage / 100);
    }

    const totalAmount = netAmount + ivaValue + iibbValue;

    // Calcular monto total en USD si aplica
    let totalAmountUSD: number | null = null;
    if (hasUSD && usdValue && usdValue > 0) {
      totalAmountUSD = totalAmount / usdValue;
    }

    const budget = await this.prisma.budget.create({
      data: {
        ...restData,
        netAmount,
        hasIva,
        ivaPercentage: hasIva ? ivaPercentage : 0,
        ivaValue,
        hasIibb,
        iibbPercentage: hasIibb ? iibbPercentage : 0,
        iibbValue,
        totalAmount,
        hasUSD,
        usdValue: hasUSD ? usdValue : null,
        totalAmountUSD,

        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            structureId: item.structureId,
            manualName: item.manualName,
          })),
        },
        descriptionItems: {
          create: descriptionItems?.map((item) => ({
            title: item.title,
            price: item.price,
            unit: item.unit,
            quantity: item.quantity ?? 1,
          })),
        },
      },
      include: {
        items: {
          include: { structure: true },
        },
        descriptionItems: true,
        client: true,
      },
    });

    return plainToInstance(BudgetResponseDto, budget, { excludeExtraneousValues: true });
  }

  async findAllBudgets(filters: FilterBudgetDto = {}): Promise<BudgetResponseDto[]> {
    const where = this.buildWhereClause(filters);

    const budgets = await this.prisma.budget.findMany({
      where,
      include: {
        items: {
          include: { structure: true },
        },
        descriptionItems: true,
        client: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // CONSULTAR RESPECTO A LA PAGINACION, POR AHORA LIMIE EN 20
    });

    return plainToInstance(BudgetResponseDto, budgets, { excludeExtraneousValues: true, }) as unknown as BudgetResponseDto[];
  }

  async findOneBudget(id: string): Promise<BudgetResponseDto> {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        items: { include: { structure: true } },
        descriptionItems: true,
        client: true,
      },
    });

    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }

    return plainToInstance(BudgetResponseDto, budget, { excludeExtraneousValues: true });
  }


  async updateBudget(id: string, updateBudgetDto: UpdateBudgetDto): Promise<BudgetResponseDto> {
    const budget = await this.prisma.budget.findFirst({
      where: { id, deletedAt: null },
      include: { items: true },
    });

    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }

    const { items, descriptionItems, ...headerUpdates } = updateBudgetDto;

    const netAmount = headerUpdates.netAmount ?? budget.netAmount;
    const hasIva = headerUpdates.hasIva ?? budget.hasIva;
    const ivaPercentage = headerUpdates.ivaPercentage ?? budget.ivaPercentage;
    const hasIibb = headerUpdates.hasIibb ?? budget.hasIibb;
    const iibbPercentage = headerUpdates.iibbPercentage ?? budget.iibbPercentage;
    const hasUSD = headerUpdates.hasUSD ?? budget.hasUSD;
    const usdValue = headerUpdates.usdValue ?? budget.usdValue;

    let ivaValue = 0;
    if (hasIva && ivaPercentage) {
      ivaValue = netAmount * (ivaPercentage / 100);
    } else if (!hasIva) {
      ivaValue = 0;
    }

    let iibbValue = 0;
    if (hasIibb && iibbPercentage) {
      iibbValue = netAmount * (iibbPercentage / 100);
    } else if (!hasIibb) {
      iibbValue = 0;
    }

    const totalAmount = netAmount + ivaValue + iibbValue;

    // Calcular monto total en USD si aplica
    let totalAmountUSD: number | null = null;
    if (hasUSD && usdValue && usdValue > 0) {
      totalAmountUSD = totalAmount / usdValue;
    }

    const updatedBudget = await this.prisma.budget.update({
      where: { id },
      data: {
        ...headerUpdates,
        netAmount,
        ivaValue,
        iibbValue,
        totalAmount,
        hasUSD,
        usdValue: hasUSD ? usdValue : null,
        totalAmountUSD,

        ...(items && {
          items: {
            deleteMany: {},
            create: items.map((item) => ({
              quantity: item.quantity,
              structureId: item.structureId,
              manualName: item.manualName,
            })),
          },
        }),
        ...(descriptionItems && {
          descriptionItems: {
            deleteMany: {},
            create: descriptionItems.map((item) => ({
              title: item.title,
              price: item.price,
              unit: item.unit,
              quantity: item.quantity ?? 1,
            })),
          },
        }),
      },
      include: {
        items: { include: { structure: true } },
        descriptionItems: true,
        client: true,
      },
    });

    return plainToInstance(BudgetResponseDto, updatedBudget, { excludeExtraneousValues: true });
  }

  async removeBudget(id: string): Promise<{ message: string }> {
    const budget = await this.prisma.budget.findFirst({
      where: { id, deletedAt: null },
    });

    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }

    await this.prisma.$transaction([
      this.prisma.budget.update({
        where: { id },
        data: { deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate() },
      }),

      this.prisma.budgetItem.updateMany({
        where: { budgetId: id },
        data: { deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate() },
      }),

      this.prisma.budgetDescriptionItem.updateMany({
        where: { budgetId: id },
        data: { deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate() },
      }),
    ]);

    return { message: 'Presupuesto eliminado exitosamente' };
  }

}