import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID') || 'placeholder-id';
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder-secret';
    const callbackURL = configService.get<string>(
      'GOOGLE_CALLBACK_URL',
      'http://localhost:4000/api/auth/google/callback',
    );

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user = {
      googleId: id,
      email: emails?.[0]?.value,
      name: [name?.givenName, name?.familyName].filter(Boolean).join(' ') || emails?.[0]?.value?.split('@')[0],
      avatarUrl: photos?.[0]?.value || null,
    };
    done(null, user);
  }
}
