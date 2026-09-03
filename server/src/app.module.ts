import { Module, NestModule, MiddlewareConsumer, RequestMethod, } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AuthModule } from './auth/auth.module.js';
import { RbacModule } from './auth/rbac.module.js';
import { AuthMiddleware } from './auth/middlewares/jwt.middleware.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module.js';
import { UsuariosModule } from './api/usuarios/usuarios.module.js';
import { ProductsModule } from './api/products/products.module.js';
import { ClientsModule } from './api/clients/clients.module.js';
import { BookingModule } from './api/booking/booking.module.js';
import { TicketsModule } from './api/tickets/tickets.module.js';
import { OrderModule } from './api/order/order.module.js';
import { N8nModule } from './webhooks/n8n/n8n.module.js';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'server',
    }),
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,
      limit: 10,
    }]),
    DatabaseModule,
    AuthModule,
    RbacModule,
    UsuariosModule,
    ProductsModule,
    ClientsModule,
    BookingModule,
    TicketsModule,
    OrderModule,
    N8nModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/', method: RequestMethod.GET },
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/register', method: RequestMethod.POST },
        { path: 'api/auth/refresh', method: RequestMethod.POST },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
        { path: 'webhooks/n8n/mensajes', method: RequestMethod.POST },
        { path: 'webhooks/n8n/reservas', method: RequestMethod.POST },
        { path: 'webhooks/n8n/pedidos', method: RequestMethod.POST },
        { path: 'webhooks/n8n/tickets', method: RequestMethod.POST },
        { path: 'webhooks/n8n/tickets/:id', method: RequestMethod.PATCH },
      )
      .forRoutes('*'); // Aplicar a todas las rutas excepto las excluidas
  }
}
