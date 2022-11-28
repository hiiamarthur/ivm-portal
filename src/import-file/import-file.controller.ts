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
                const result = await this.service.readUploadFile(file.buffer, { ...reqBody, schema: req.user.schema });
                if(result) {
                    res.status(HttpStatus.OK).json({ message: 'upload success'});    
                } else {
                    throw new BadRequestException({ message: 'upload fail'})
                }
            } catch (error) {
                throw new BadRequestException(error)
            }
        } else {
            throw new BadRequestException('no upload file')
        }
    }

}
