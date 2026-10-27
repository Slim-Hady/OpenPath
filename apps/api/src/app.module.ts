import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { InfraModule } from './infra/infra.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { GithubModule } from './modules/github/github.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CvModule } from './modules/cv/cv.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { SelectionModule } from './modules/selection/selection.module';
import { SavedModule } from './modules/saved/saved.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { GuideModule } from './modules/guide/guide.module';
import { PublicProfileModule } from './modules/public-profile/public-profile.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { CommunityModule } from './modules/community/community.module';
import { OutreachModule } from './modules/outreach/outreach.module';
import { LearningModule } from './modules/learning/learning.module';
import { AdminModule } from './modules/admin/admin.module';
import { JobsModule } from './jobs/jobs.module';
import { HealthController } from './health.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { LoggingInterceptor } from './common/logging.interceptor';
import { RequestIdMiddleware } from './common/request-id.middleware';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 180 }]),
    PrismaModule,
    InfraModule,
    AuthModule,
    AiModule,
    GithubModule,
    ProfileModule,
    CvModule,
    NotificationsModule,
    SelectionModule,
    SavedModule,
    DiscoveryModule,
    OnboardingModule,
    GuideModule,
    PublicProfileModule,
    AchievementsModule,
    CommunityModule,
    OutreachModule,
    LearningModule,
    AdminModule,
    JobsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
