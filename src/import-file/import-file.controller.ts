import { Controller, Request,Response,  Body, Put, UseInterceptors, UploadedFile, HttpStatus, BadRequestException, Inject, Logger, LoggerService } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportFileService } from './import-file.service';


@Controller('import-file')
export class ImportFileController {

    constructor(
        @Inject(Logger) private readonly logger: LoggerService,
        private service: ImportFileService
    ){}

    @Put()
    @UseInterceptors(FileInterceptor('importedFile'))
    async handleUploadFile(@Request() req, @Body() reqBody, @UploadedFile() file, @Response() res) {
        if(file) {
            try {
                await this.service.readUploadFile(file.buffer, { ...reqBody, schema: req.user.schema });
                res.status(HttpStatus.OK).json({ message: 'upload success'});    
            } catch (error) {
                throw new BadRequestException(error)
            }
        } else {
            throw new BadRequestException('no upload file')
        }
    }

}
