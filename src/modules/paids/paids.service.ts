import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '~/prisma';
import { CreatePaidDto, UpdatePaidDto, PaidResponseDto, FilterPaidDto } from './dto';
import { PaginationQueryDto } from '~/modules/users/dto';
import { plainToInstance } from 'class-transformer';
import { createPaginationMeta, PaginatedResponseDto } from '~/common/interfaces';
import { DateTime } from 'luxon';

@Injectable()
export class PaidsService {
  private readonly NUMBER_PREFIX = '001';
  private readonly NUMBER_PADDING = 5; // 00001, 00002, etc.

  constructor(private prisma: PrismaService) { }

  /**
   * Genera el siguiente número secuencial para un pago
   * Formato: 001-00001, 001-00002, etc.
   */
  private async generateNextNumber(): Promise<string> {
    // Buscar el último número creado (incluyendo soft deletes para mantener secuencia)
    const lastPaid = await this.prisma.paid.findFirst({
      where: {
        number: {
          startsWith: `${this.NUMBER_PREFIX}-`,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        number: true,
      },
    });

    let nextSequence = 1;

    if (lastPaid && lastPaid.number) {
      // Extraer el número después del "-"
      const parts = lastPaid.number.split('-');
      if (parts.length === 2) {
        const lastSequence = parseInt(parts[1], 10);
        if (!isNaN(lastSequence)) {
          nextSequence = lastSequence + 1;
        }
      }
    }

    // Formatear con padding de ceros
    const sequenceStr = nextSequence.toString().padStart(this.NUMBER_PADDING, '0');
    return `${this.NUMBER_PREFIX}-${sequenceStr}`;
  }

  private buildWhereClause(filters: FilterPaidDto) {
    const where: any = { deletedAt: null };

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.number) {
      where.number = { contains: filters.number, mode: 'insensitive' };
    }

    if (filters.bill) {
      where.bill = { contains: filters.bill, mode: 'insensitive' };
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

    if (filters.dateFrom !== undefined || filters.dateTo !== undefined) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.date.lte = new Date(filters.dateTo);
      }
    }

    return where;
  }

  async create(createPaidDto: CreatePaidDto): Promise<PaidResponseDto> {
    // Extraer campos USD
    const { hasUSD, usdValue, amountUSD, ...paidData } = createPaidDto;

    // Validar que el proyecto existe
    const project = await this.prisma.project.findFirst({
      where: {
        id: createPaidDto.projectId,
        deletedAt: null
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Validar que el monto del pago no exceda el restante
    if (createPaidDto.amount > project.rest) {
      throw new BadRequestException(
        `El monto del pago ($${createPaidDto.amount}) excede el restante del proyecto ($${project.rest})`
      );
    }

    // Generar número secuencial automáticamente
    const number = await this.generateNextNumber();

    const paid = await this.prisma.paid.create({
      data: {
        ...paidData,
        number,
        date: new Date(createPaidDto.date),
        hasUSD: hasUSD || false,
        usdValue: hasUSD ? usdValue : null,
        amountUSD: hasUSD ? amountUSD : null,
      },
      include: {
        project: true,
      },
    });

    // Actualizar totales del proyecto
    await this.recalculateProjectTotals(createPaidDto.projectId);

    return plainToInstance(PaidResponseDto, paid, { excludeExtraneousValues: true });
  }

  async findAll(filters: FilterPaidDto = {}): Promise<PaidResponseDto[]> {
    const where = this.buildWhereClause(filters);

    const paids = await this.prisma.paid.findMany({
      where,
      include: { project: { include: { client: true } } },
      orderBy: { date: 'desc' },
    });

    return plainToInstance(PaidResponseDto, paids, { excludeExtraneousValues: true });
  }

  async findAllPaginated(
    paginationQuery: PaginationQueryDto,
    filters: FilterPaidDto = {}
  ): Promise<PaginatedResponseDto<PaidResponseDto>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const [paids, total] = await Promise.all([
      this.prisma.paid.findMany({
        where,
        include: { project: { include: { client: true } } },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.paid.count({ where }),
    ]);

    const data = plainToInstance(PaidResponseDto, paids, { excludeExtraneousValues: true });
    const meta = createPaginationMeta(page, limit, total);

    return { data, meta };
  }

  async findOne(id: string): Promise<PaidResponseDto> {
    const paid = await this.prisma.paid.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: { project: { include: { client: true } } },
    });

    if (!paid) {
      throw new NotFoundException('Pago no encontrado');
    }

    return plainToInstance(PaidResponseDto, paid, { excludeExtraneousValues: true });
  }

  async findByProject(projectId: string): Promise<PaidResponseDto[]> {
    const paids = await this.prisma.paid.findMany({
      where: {
        projectId,
        deletedAt: null
      },
      orderBy: { date: 'desc' },
    });

    return plainToInstance(PaidResponseDto, paids, { excludeExtraneousValues: true });
  }

  async update(id: string, updatePaidDto: UpdatePaidDto): Promise<PaidResponseDto> {
    const paid = await this.prisma.paid.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: { project: true },
    });

    if (!paid) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Si se actualiza el monto, validar que no exceda el restante del proyecto
    if (updatePaidDto.amount !== undefined) {
      const currentTotalPaid = paid.project.totalPaid;
      const newTotalPaid = currentTotalPaid - paid.amount + updatePaidDto.amount;
      const newRest = paid.project.amount - newTotalPaid;

      if (newRest < 0) {
        throw new BadRequestException(
          `El nuevo monto del pago excedería el total del proyecto`
        );
      }
    }

    const dataToUpdate: any = { ...updatePaidDto };

    if (updatePaidDto.date) {
      dataToUpdate.date = new Date(updatePaidDto.date);
    }

    const updatedPaid = await this.prisma.paid.update({
      where: { id },
      data: dataToUpdate,
      include: { project: { include: { client: true } } },
    });

    // Actualizar totales del proyecto
    await this.recalculateProjectTotals(paid.projectId);

    return plainToInstance(PaidResponseDto, updatedPaid, { excludeExtraneousValues: true });
  }

  async remove(id: string): Promise<{ message: string }> {
    const paid = await this.prisma.paid.findFirst({
      where: {
        id,
        deletedAt: null
      },
    });

    if (!paid) {
      throw new NotFoundException('Pago no encontrado');
    }

    const projectId = paid.projectId;

    // Soft delete
    await this.prisma.paid.update({
      where: { id },
      data: {
        deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate(),
      },
    });

    // Actualizar totales del proyecto
    await this.recalculateProjectTotals(projectId);

    return { message: 'Pago eliminado exitosamente' };
  }

  // Método privado para recalcular totales del proyecto
  private async recalculateProjectTotals(projectId: string): Promise<void> {
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
}

