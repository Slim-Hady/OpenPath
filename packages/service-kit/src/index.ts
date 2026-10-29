/**
 * PM1 service kit: the shared runtime for the per-service deployment layer.
 *
 * Every service under `services/<name>` is a real container with its own
 * database. It exposes:
 *   GET /health     process + own database
 *   GET /meta       service contract (provides, requires, owns)
 *   GET /db/tables  tables that actually exist in its database
 *
 * Business endpoints stay in the modular monolith (`apps/api/src/modules`);
 * this layer exists to satisfy the PM1 "one container and one database per
 * service" requirement without duplicating the product logic.
 */
import 'reflect-metadata';
import {
  Controller,
  DynamicModule,
  Get,
  Inject,
  Injectable,
  Module,
  OnModuleDestroy,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Pool } from 'pg';

export const SERVICE_DEFINITION = Symbol('SERVICE_DEFINITION');

export interface ServiceDefinition {
  /** Display name, e.g. "Developer Profile". */
  name: string;
  /** Container / folder slug, e.g. "developer-profile". */
  slug: string;
  /** Sprint that first uses this service, e.g. "Sprint 1". */
  sprint: string;
  /** Database owned by this service, e.g. "developer_profile_db". */
  database: string;
  /** Provided interfaces. */
  provides: string[];
  /** Required interfaces. */
  requires: string[];
  /** Tables owned by this service. */
  owns: string[];
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(
    @Inject(SERVICE_DEFINITION) private readonly service: ServiceDefinition,
  ) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(`${service.slug}: DATABASE_URL is required`);
    }
    this.pool = new Pool({
      connectionString: url,
      max: 4,
      connectionTimeoutMillis: 3_000,
      idleTimeoutMillis: 10_000,
    });
  }

  async ping(): Promise<boolean> {
    try {
      await this.pool.query('select 1');
      return true;
    } catch {
      return false;
    }
  }

  async tables(): Promise<string[]> {
    const result = await this.pool.query<{ table_name: string }>(
      `select table_name
         from information_schema.tables
        where table_schema = 'public' and table_type = 'BASE TABLE'
        order by table_name`,
    );
    return result.rows.map((row) => row.table_name);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

@Controller()
export class ServiceController {
  constructor(
    private readonly database: DatabaseService,
    @Inject(SERVICE_DEFINITION) private readonly service: ServiceDefinition,
  ) {}

  @Get('health')
  async health(): Promise<Record<string, unknown>> {
    const databaseUp = await this.database.ping();
    let tableCount = 0;
    if (databaseUp) {
      tableCount = (await this.database.tables()).length;
    }
    return {
      status: databaseUp ? 'ok' : 'degraded',
      service: this.service.slug,
      sprint: this.service.sprint,
      database: this.service.database,
      databaseUp,
      tableCount,
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  @Get('meta')
  meta(): Record<string, unknown> {
    return {
      ...this.service,
      runtime: `node ${process.version}`,
      note: 'PM1 deployment layer. Product endpoints live in apps/api/src/modules.',
    };
  }

  @Get('db/tables')
  async tables(): Promise<Record<string, unknown>> {
    const tables = await this.database.tables();
    return {
      service: this.service.slug,
      database: this.service.database,
      tables,
      expected: this.service.owns,
      matches: tables.length === this.service.owns.length,
    };
  }
}

@Module({})
export class ServiceKitModule {
  static forRoot(service: ServiceDefinition): DynamicModule {
    return {
      module: ServiceKitModule,
      providers: [
        { provide: SERVICE_DEFINITION, useValue: service },
        DatabaseService,
      ],
      controllers: [ServiceController],
      exports: [DatabaseService],
    };
  }
}

export async function bootstrapService(
  service: ServiceDefinition,
): Promise<void> {
  const app = await NestFactory.create(ServiceKitModule.forRoot(service), {
    logger: ['error', 'warn', 'log'],
  });
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`${service.name} listening on :${port} (db ${service.database})`);
}
