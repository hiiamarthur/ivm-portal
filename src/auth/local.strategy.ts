import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

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
          return done(null,user);
        } catch(error){
          return done(error);
        }
      }
    });
  }

  async validate(username: string, password: string, schema?: string): Promise<any> {
    const user = await this.authService.validateUser(username, password, schema);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}