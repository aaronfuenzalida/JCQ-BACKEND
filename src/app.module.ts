import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { ClientsModule } from './modules/clients';
import { ProjectsModule } from './modules/projects';
import { PaidsModule } from './modules/paids';
import { JwtAuthGuard } from './common/guards';
import { ResponseInterceptor } from './common/interceptors';
import { AllExceptionsFilter } from './common/filters';
import { HttpLoggerMiddleware, ErrorTrackerInterceptor } from './common/logger';
import { StaffModule } from './modules/staff';
import { StructuresModule } from './modules/structures';
import { BudgetsModule } from './modules/budgets';
import { CollaboratorsModule } from './modules/collaborators';
import { CashControlModule } from './modules/cashControl';
import { DolarService } from './common/services/dolar.service';
import { DispatchModule } from './modules/dispatch';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Rate Limiting: 100 requests per minute
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    ProjectsModule,
    PaidsModule,
    StaffModule,
    StructuresModule,
    BudgetsModule,
    CollaboratorsModule,
    CashControlModule,
    DispatchModule,
  ],
  controllers: [AppController],
  providers: [
    DolarService,
    AppService,
    // Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // JWT Auth Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Response Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // Error Tracker Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorTrackerInterceptor,
    },
    // Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // HTTP Logger Middleware para todas las rutas
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
