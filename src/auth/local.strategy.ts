import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

//ref https://dev.to/nestjs/authentication-and-sessions-for-mvc-apps-with-nestjs-55a4
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService
  ){
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function (req, username, password, done) {
      {
        try {
          const user = this.validate(username,password,req.body.schema);
          if(req.body.rememberme) {
            req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000
          } else {
            req.session.cookie.expires = false
          }
          return done(null,user);
        } catch(error){
          return done(error);
        }
      }
    });
  }

  async validate(username: string, password: string, params?: string): Promise<any> {
    const schema = this.getSchema(params);
    if(!schema) {
      throw new UnauthorizedException();
    }
    const user = await this.authService.validateUser(username, password, schema);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  getSchema = (params) => {
    switch(params) {
        case 'IV':
            return 'iVendingDB_IVM';
        case 'HS':
            return 'iVendingDB_Hosting';
        case 'NW':
            return 'iVendingDB_NW';
        case 'CS':
            return 'iVendingDB_CS';
        default:
            return null;
    }
}
}