import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseJwtService } from './supabase-jwt.service';

@Global()
@Module({
  providers: [AuthService, SupabaseJwtService],
  exports: [AuthService, SupabaseJwtService],
})
export class AuthModule {}
