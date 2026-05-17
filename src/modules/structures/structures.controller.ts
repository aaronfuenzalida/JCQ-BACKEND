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
import { StructuresService } from './structures.service';
import {
    CreateStructureDto,
    FilterStructureDto,
    StructureResponseDto,
    UpdateStructureDto,
    CreateStructureCategoryDto,
    StructureCategoryResponseDto,
    UpdateStructureCategoryDto,
    FilterStructureCategoryDto
} from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '~/common/guards';
import { AuditInterceptor } from '~/common/interceptors';
import { Roles, Auditory } from '~/common/decorators';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '~/modules/users/dto';


@ApiTags('Estructuras')
@ApiBearerAuth()
@Controller('structures')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class StructuresController {
    constructor(private readonly structuresService: StructuresService) { }

    // STRUCTURE CATEGORY ENDPOINTS

    @Post('categories')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @Auditory({ action: 'CREATE', entity: 'StructureCategory' })
    @ApiOperation({ summary: 'Crear categoría de estructura' })
    @ApiResponse({
        status: 201,
        description: 'Categoría creada exitosamente',
        type: StructureCategoryResponseDto,
    })
    createCategory(@Body() dto: CreateStructureCategoryDto): Promise<StructureCategoryResponseDto> {
        return this.structuresService.createCategory(dto);
    }

    @Get('categories')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Obtener todas las categorías de estructura' })
    @ApiQuery({ name: 'name', required: false, type: String, description: 'Buscar por nombre (parcial)' })
    @ApiResponse({
        status: 200,
        description: 'Lista de categorías',
        type: [StructureCategoryResponseDto],
    })
    findAllCategories(@Query() filters: FilterStructureCategoryDto): Promise<StructureCategoryResponseDto[]> {
        return this.structuresService.getAllCategories(filters);
    }

    @Get('categories/:id')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Obtener una categoría por ID' })
    @ApiResponse({
        status: 200,
        type: StructureCategoryResponseDto,
    })
    findOneCategory(@Param('id') id: string): Promise<StructureCategoryResponseDto> {
        return this.structuresService.getCategoryById(id);
    }

    @Patch('categories/:id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @Auditory({ action: 'UPDATE', entity: 'StructureCategory' })
    @ApiOperation({ summary: 'Actualizar categoría de estructura' })
    @ApiResponse({
        status: 200,
        type: StructureCategoryResponseDto,
    })
    updateCategory(@Param('id') id: string, @Body() dto: UpdateStructureCategoryDto): Promise<StructureCategoryResponseDto> {
        return this.structuresService.updateCategory(id, dto);
    }

    @Delete('categories/:id')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
    @Auditory({ action: 'DELETE', entity: 'StructureCategory' })
    @ApiOperation({ summary: 'Eliminar categoría de estructura (soft delete)' })
    @ApiResponse({
        status: 200,
        description: 'Categoría eliminada exitosamente',
    })
    removeCategory(@Param('id') id: string) {
        return this.structuresService.deleteCategory(id);
    }

    // STRUCTURE ENDPOINTS

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @Auditory({ action: 'CREATE', entity: 'Structure' })
    @ApiOperation({ summary: 'Crear estructura' })
    @ApiResponse({
        status: 201,
        description: 'Estructura creada exitosamente',
        type: StructureResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Error en los datos proporcionados',
    })
    createStructure(@Body() createStructureDto: CreateStructureDto): Promise<StructureResponseDto> {
        return this.structuresService.createStructure(createStructureDto);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @ApiOperation({
        summary: 'Obtener todas las estructuras (sin paginación)',
        description: 'Filtra por: nombre y categoría'
    })
    @ApiQuery({ name: 'name', required: false, type: String, description: 'Buscar por nombre (parcial)' })
    @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filtrar por ID de categoría' })
    @ApiResponse({
        status: 200,
        description: 'Lista completa de estructuras filtradas',
        type: [StructureResponseDto],
    })
    async findAll(@Query() filters: FilterStructureDto): Promise<StructureResponseDto[]> {
        return this.structuresService.getAllStructures(filters);
    }

    @Get('pagination')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @ApiOperation({
        summary: 'Obtener estructuras con paginación',
        description: 'Filtra por: nombre y categoría'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Registros por página', example: 10 })
    @ApiQuery({ name: 'name', required: false, type: String, description: 'Buscar por nombre (parcial)' })
    @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filtrar por ID de categoría' })
    @ApiResponse({
        status: 200,
        description: 'Lista paginada de estructuras filtradas',
    })
    async findAllPaginated(@Query() filters: FilterStructureDto) {
        const { page, limit, ...restFilters } = filters;
        return this.structuresService.findAllPaginated({ page, limit }, restFilters);
    }


    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Obtener detalle de una estructura (incluye proyectos asignados)' })
    @ApiResponse({
        status: 200,
        type: StructureResponseDto,
    })
    async findOne(@Param('id') id: string) {
        return this.structuresService.getStructureById(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @Auditory({ action: 'UPDATE', entity: 'Structure' })
    @ApiOperation({ summary: 'Actualizar datos de la estructura' })
    updateStructure(@Param('id') id: string, @Body() updateStructureDto: UpdateStructureDto) {
        return this.structuresService.updateStructure(id, updateStructureDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
    @Auditory({ action: 'DELETE', entity: 'Structure' })
    @ApiOperation({ summary: 'Eliminar una estructura (soft delete)' })
    @ApiResponse({
        status: 200,
        description: 'Estructura eliminada exitosamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Estructura no encontrada',
    })
    async removeStructure(@Param('id') id: string) {
        return this.structuresService.deleteStructure(id);
    }

    @Get(':id/usage')
    @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
    @ApiOperation({
        summary: 'Obtener los proyectos que usan una estructura específica'
    })
    async findUsage(@Param('id') id: string) {
        return this.structuresService.findUsage(id);
    }
}