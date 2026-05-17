import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DispatchService } from './dispatch.service';
import {
    CreateDispatchDTO,
    UpdateDispatchDTO,
    DispatchResponseDTO,
    FilterDispatchDTO,
    CreateDispatchItemDTO,
    UpdateDispatchItemDTO,
    DispatchItemResponseDTO
} from './dto';
import { JwtAuthGuard, RolesGuard } from '~/common/guards';
import { Roles, Auditory } from '~/common/decorators';
import { UserRole } from '@prisma/client';
import { AuditInterceptor } from '~/common/interceptors';
import { PaginationQueryDto } from '~/modules/users/dto';

@ApiTags('Despachos')
@ApiBearerAuth()
@Controller('dispatches')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class DispatchController {
    constructor(private readonly dispatchService: DispatchService) { }

    // DISPATCH ENDPOINTS 

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @Auditory({ action: 'CREATE', entity: 'Dispatch' })
    @ApiOperation({
        summary: 'Crear un nuevo despacho/remito',
        description: 'Crea un remito de despacho con los items (estructuras) enviados'
    })
    @ApiResponse({
        status: 201,
        description: 'Despacho creado exitosamente',
        type: DispatchResponseDTO,
    })
    async create(@Body() createDispatchDTO: CreateDispatchDTO): Promise<DispatchResponseDTO> {
        return this.dispatchService.createDispatch(createDispatchDTO);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @ApiOperation({
        summary: 'Obtener todos los despachos',
        description: 'Lista todos los despachos con filtros opcionales'
    })
    @ApiQuery({ name: 'projectId', required: false, type: String, description: 'ID del proyecto' })
    @ApiQuery({ name: 'dateInit', required: false, type: String, description: 'Fecha inicio (ISO)' })
    @ApiQuery({ name: 'dateEnd', required: false, type: String, description: 'Fecha fin (ISO)' })
    @ApiQuery({ name: 'driverCuit', required: false, type: String, description: 'CUIT del chofer' })
    @ApiQuery({ name: 'licensePlate', required: false, type: String, description: 'Patente del vehículo' })
    @ApiQuery({ name: 'clientName', required: false, type: String, description: 'Nombre del cliente' })
    @ApiResponse({
        status: 200,
        description: 'Lista de despachos',
        type: [DispatchResponseDTO],
    })
    async findAll(@Query() filters: FilterDispatchDTO): Promise<DispatchResponseDTO[]> {
        return this.dispatchService.getAllDispatches(filters);
    }

    @Get('pagination')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @ApiOperation({
        summary: 'Obtener despachos con paginación',
        description: 'Lista despachos con paginación servidor-lado y filtros opcionales'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Registros por página', example: 10 })
    @ApiQuery({ name: 'projectId', required: false, type: String, description: 'ID del proyecto' })
    @ApiQuery({ name: 'dateInit', required: false, type: String, description: 'Fecha inicio (ISO)' })
    @ApiQuery({ name: 'dateEnd', required: false, type: String, description: 'Fecha fin (ISO)' })
    @ApiQuery({ name: 'driverCuit', required: false, type: String, description: 'CUIT del chofer' })
    @ApiQuery({ name: 'licensePlate', required: false, type: String, description: 'Patente del vehículo' })
    @ApiQuery({ name: 'clientName', required: false, type: String, description: 'Nombre del cliente' })
    @ApiResponse({
        status: 200,
        description: 'Lista paginada de despachos',
    })
    async findAllPaginated(
        @Query() paginationQuery: PaginationQueryDto,
        @Query() filters: FilterDispatchDTO
    ) {
        return this.dispatchService.getAllDispatchesPaginated(paginationQuery, filters);
    }


    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @Auditory({ action: 'UPDATE', entity: 'Dispatch' })
    @ApiOperation({ summary: 'Actualizar un despacho' })
    @ApiResponse({
        status: 200,
        description: 'Despacho actualizado exitosamente',
        type: DispatchResponseDTO,
    })
    @ApiResponse({
        status: 404,
        description: 'Despacho no encontrado',
    })
    async update(
        @Param('id') id: string,
        @Body() updateDispatchDTO: UpdateDispatchDTO,
    ): Promise<DispatchResponseDTO> {
        return this.dispatchService.updateDispatch(id, updateDispatchDTO);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
    @Auditory({ action: 'DELETE', entity: 'Dispatch' })
    @ApiOperation({ summary: 'Eliminar un despacho (soft delete)' })
    @ApiResponse({
        status: 200,
        description: 'Despacho eliminado exitosamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Despacho no encontrado',
    })
    async remove(@Param('id') id: string) {
        return this.dispatchService.deleteDispatch(id);
    }

    // DISPATCH ITEMS ENDPOINTS 

    @Post(':dispatchId/items')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @Auditory({ action: 'CREATE', entity: 'DispatchItem' })
    @ApiOperation({ summary: 'Agregar un item a un despacho existente' })
    @ApiResponse({
        status: 201,
        description: 'Item agregado correctamente',
        type: DispatchItemResponseDTO,
    })
    @ApiResponse({
        status: 404,
        description: 'Despacho no encontrado',
    })
    async addItem(
        @Param('dispatchId') dispatchId: string,
        @Body() createDispatchItemDTO: CreateDispatchItemDTO,
    ): Promise<DispatchItemResponseDTO> {
        return this.dispatchService.createDispatchItem(dispatchId, createDispatchItemDTO);
    }

    @Get(':dispatchId/items')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Obtener todos los items de un despacho' })
    @ApiResponse({
        status: 200,
        description: 'Lista de items del despacho',
        type: [DispatchItemResponseDTO],
    })
    async getItems(@Param('dispatchId') dispatchId: string): Promise<DispatchItemResponseDTO[]> {
        return this.dispatchService.getAllDispatchItems(dispatchId);
    }

    @Patch('items/:id')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @Auditory({ action: 'UPDATE', entity: 'DispatchItem' })
    @ApiOperation({ summary: 'Actualizar un item de despacho' })
    @ApiResponse({
        status: 200,
        description: 'Item actualizado exitosamente',
        type: DispatchItemResponseDTO,
    })
    @ApiResponse({
        status: 404,
        description: 'Item no encontrado',
    })
    async updateItem(
        @Param('id') id: string,
        @Body() updateDispatchItemDTO: UpdateDispatchItemDTO,
    ): Promise<DispatchItemResponseDTO> {
        return this.dispatchService.updateDispatchItem(id, updateDispatchItemDTO);
    }

    @Delete('items/:id')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
    @Auditory({ action: 'DELETE', entity: 'DispatchItem' })
    @ApiOperation({ summary: 'Eliminar un item de despacho (soft delete)' })
    @ApiResponse({
        status: 200,
        description: 'Item eliminado exitosamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Item no encontrado',
    })
    async removeItem(@Param('id') id: string) {
        return this.dispatchService.deleteDispatchItem(id);
    }
}
