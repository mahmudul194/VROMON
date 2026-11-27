import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID', '');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET', '');
    const webOrigin = this.configService.get<string>('WEB_ORIGIN', 'http://localhost:3000');

    const isUnconfigured =
      !clientId ||
      !clientSecret ||
      clientId.includes('placeholder') ||
      clientId.includes('your-google-client-id');

    if (isUnconfigured || req.query?.error) {
      const reason = isUnconfigured ? 'google_not_configured' : 'google_auth_failed';
      res.redirect(`${webOrigin}/login?error=${reason}`);
      return false;
    }

    return super.canActivate(context);
  }
}
