import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerService } from './owner.service';
import { OwnerLogin, OwnerPermission } from '../entities/owner';

@Module({
  imports: [TypeOrmModule.forFeature([OwnerLogin, OwnerPermission])],
  providers: [OwnerService],
  controllers: [],
  exports: [OwnerService],
})
export class OwnerModule {}
