import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  
  private readonly logger = new Logger('HttpException');

  catch(error: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = (error instanceof HttpException) ? error.getStatus(): HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === HttpStatus.NOT_FOUND) 
        return response.status(status).render('404');
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(error.stack);
        return response.status(status).render('500');
    } else {
        this.logger.error(error.message);
        return response.status(status).send({ message: error.message }); 
    }
  }
}