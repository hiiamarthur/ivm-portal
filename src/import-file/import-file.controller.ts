import { Controller, Request,Response,  Body, Put, UseInterceptors, UploadedFile, HttpStatus, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportFileService } from './import-file.service';


@Controller('import-file')
export class ImportFileController {

    constructor(
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
                console.error(error)
                res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
            }
            
        } else {
            throw new BadRequestException('no upload file')
        }
    }

}
