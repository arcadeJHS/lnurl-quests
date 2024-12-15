import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    console.log('==> apiKey:', apiKey);
    console.log(this.configService.get('app.apiKey'));

    if (!apiKey || apiKey !== this.configService.get('app.apiKey')) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
