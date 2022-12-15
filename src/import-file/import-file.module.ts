import { Logger, Module } from '@nestjs/common';
import { ImportFileController } from './import-file.controller';
import { ImportFileService } from './import-file.service';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';

@Module({
  imports: [HostingModule, NwgroupModule, CsModule],
  controllers: [ImportFileController],
  providers: [Logger, ImportFileService]
})
export class ImportFileModule {}
