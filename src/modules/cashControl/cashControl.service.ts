import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '~/prisma';
import { CreateExpenseCategoryDTO,
CreateExpenseDTO,
ExpenseCategoryResponseDTO,
ExpenseResponseDTO,
FilterExpenseCategoryDTO,
FilterExpenseDTO,
UpdateExpenseDto,
UpdateExpenseCategoryDto 
} from './dto';
import { PaginationQueryDto } from '~/modules/users/dto'; 
import { plainToInstance } from 'class-transformer';
import { createPaginationMeta, PaginatedResponseDto } from '~/common/interfaces'; 
import { DateTime } from 'luxon';

@Injectable()
export class CashControlService{
  constructor (private readonly prisma: PrismaService){}

  //Construir filtros para buscar gastos
  private buildWhereClauseExp(filters: FilterExpenseDTO) {
      const where: any = { deletedAt: null };

      // Filtro por Relacion: Nombre de la Categoría
      if (filters.expenseCategoryName) {
      where.category = {
          name: { 
              contains: filters.expenseCategoryName, 
              mode: 'insensitive' 
          },
      };
      }

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

    //Construir filtros para buscar categorias
  private buildWhereClauseExpCategory(filters: FilterExpenseCategoryDTO) {
    const where: any = { deletedAt: null };

    if (filters.expenseCategoryName) {
      where.name = {
        contains: filters.expenseCategoryName,
        mode: 'insensitive',
      };
    }

    return where;
    }

    //Crear categoria de gasto
  async createExpenseCategory(createExpenseCategoryDto: CreateExpenseCategoryDTO) : Promise <ExpenseCategoryResponseDTO>{
    if (!createExpenseCategoryDto.name) {
      throw new BadRequestException('Debe proporcionar nombre para la categoria del gasto');
    }
    const { expenses, ...categoryData } = createExpenseCategoryDto;
    const expenseCategory = await this.prisma.expenseCategory.create({
      data: {
        ...categoryData, 
        
        expenses: expenses && expenses.length > 0 ? {
            create: expenses.map(exp => ({
                description: exp.description,
                amount: exp.amount,
                date: new Date(exp.date) 
            }))
        } : undefined
      },
      include: {
        expenses: true 
      }
    });

    return plainToInstance(ExpenseCategoryResponseDTO, expenseCategory, { excludeExtraneousValues: true });
  }

  // Crear gasto
    async createExpense(createExpenseDto: CreateExpenseDTO): Promise<ExpenseResponseDTO> {
  if (!createExpenseDto.categoryId) {
      throw new BadRequestException('El gasto debe tener una categoría asignada');
  }
  // Verificar si viene un WorkRecord y si es valido 
  if (createExpenseDto.workRecordId) {
     const record = await this.prisma.workRecord.findUnique({ 
        where: { id: createExpenseDto.workRecordId } 
     });
     if (!record) throw new NotFoundException('La planilla de horas indicada no existe');
  }

  const expense = await this.prisma.expense.create({
    data: {
      description: createExpenseDto.description,
      amount: createExpenseDto.amount,
      date: new Date(createExpenseDto.date),
      categoryId: createExpenseDto.categoryId,
      workRecordId: createExpenseDto.workRecordId 
    },
    include: {
      category: true,
      workRecord: { include: { staff: true } } // Para devolver info del empleado si es necesario
    }
  });

  return plainToInstance(ExpenseResponseDTO, expense, { excludeExtraneousValues: true });
}

    //Obtener gastos
  async getAllExpenses(filters: FilterExpenseDTO = {}): Promise<ExpenseResponseDTO[]>{
    const where = this.buildWhereClauseExp(filters)

    const expenses = await this.prisma.expense.findMany({
        where,
        orderBy:[ { date: 'desc' }, {createdAt: 'desc'} ],
        include: { category: true }
    });

    return plainToInstance (ExpenseResponseDTO,expenses,{ excludeExtraneousValues: true })
  }

  //Obtener categoria de gastos
  async getAllCategoryExpenses(filters: FilterExpenseCategoryDTO = {}) : Promise<ExpenseCategoryResponseDTO[]>{
    const where = this.buildWhereClauseExpCategory(filters)

    const categoryExpenses = await this.prisma.expenseCategory.findMany({
        where,
        orderBy: {createdAt:'desc'},
    });

    return plainToInstance (ExpenseCategoryResponseDTO, categoryExpenses,{ excludeExtraneousValues: true })
  }

  //Actualizar gasto
  async updateExpense(id:string,data: UpdateExpenseDto){
    const expense= await this.prisma.expense.findUnique({
      where: {id}
    });
    
    if(!expense){
      throw new NotFoundException(`Gasto con id ${id} no encontrado`)
    }

    //Se separan los datos nuevamente
    const { date, ...rest } = data;

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        // Se copia el resto de campos (amount, description, categoryId, etc.)
        ...rest,
        // Solo se intenta convertir y guardar la fecha SI el usuario envió una nueva.
        ...(date && { date: new Date(date) }),
      },
      // Se incluye la categoría para que el DTO de respuesta este completo
      include: {
        category: true
      }
    });

    return plainToInstance(ExpenseResponseDTO,updatedExpense,{ excludeExtraneousValues: true })
  }

  //Actualizar categoria de gasto
  async updateCategoryExpense(id:string, data: UpdateExpenseCategoryDto){
    const categoryExp = await this.prisma.expenseCategory.findUnique({
      where : {id},
    });

    if(!categoryExp){
      throw new NotFoundException(`Categoria de gasto con id ${id} no encontrada`)
    }

    //Separar los gastos del resto de datos (name, description)
    const { expenses, ...updateData } = data;

    const categoryUpdated= await this.prisma.expenseCategory.update({
      where: {id},
      data: updateData,
    });

    return plainToInstance(ExpenseCategoryResponseDTO,categoryUpdated,{ excludeExtraneousValues: true } )
  }

  async findAllExpensesPaginated(
        paginationQuery: PaginationQueryDto,
        filters: FilterExpenseDTO = {}
      ): Promise<PaginatedResponseDto<ExpenseResponseDTO>> {
        const { page = 1, limit = 10 } = paginationQuery;
        const skip = (page - 1) * limit;
        const where = this.buildWhereClauseExp(filters);
    
        const [expenses, total] = await Promise.all([
          this.prisma.expense.findMany({
            where,
            skip,
            take: limit,
            orderBy: [ { date:'desc' }, { createdAt: 'desc' }],
            include: { category: true }
          }),
          this.prisma.expense.count({ where }),
        ]);
    
        const data = plainToInstance(ExpenseResponseDTO, expenses, { excludeExtraneousValues: true });
        const meta = createPaginationMeta(page, limit, total);
    
        return { data, meta };
      }


  async removeExpenseCategory(categoryId:string) : Promise<{ message: string }> {   //Soft delete
    const expenseCat = await this.prisma.expenseCategory.findUnique({
      where:{id: categoryId,
      deletedAt: null},
    });

    if(!expenseCat){
      throw new NotFoundException(`Categoria de gasto con id ${categoryId} no encontrado`)
    }

    await this.prisma.expenseCategory.update({
    where: { id: categoryId },
      data: {
        deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate(),
      },
    });
    return {message:'Categoria de gasto eliminado exitosamente'};
  }
  
  async removeExpense(expenseId:string) : Promise<{ message: string }> {   //Soft delete
    const expense = await this.prisma.expense.findUnique({
      where:{id: expenseId,
      deletedAt: null},
    });

    if(!expense){
      throw new NotFoundException(`Gasto con id ${expenseId} no encontrado`)
    }

    await this.prisma.expense.update({
    where: { id: expenseId },
      data: {
        deletedAt: DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate(),
        workRecordId: null
      },
    });
    return {message:'Gasto eliminado exitosamente'};
  }

  

 

}