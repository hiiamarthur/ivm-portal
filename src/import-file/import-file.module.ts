import { Logger, Module } from '@nestjs/common';
import { ImportFileController } from './import-file.controller';
import { ImportFileService } from './import-file.service';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { NwgroupModule } from '../nwgroup/nwgroup.module';

@Module({
  imports: [HostingModule, NwgroupModule],
  controllers: [ImportFileController],
  providers: [Logger, ImportFileService, HostingService, NwgroupService]
})
export class ImportFileModule {}
