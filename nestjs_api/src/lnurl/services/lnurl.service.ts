import { Injectable } from '@nestjs/common';
import { encode } from 'lnurl';

@Injectable()
export class LNURLService {
  async generateLnurlLink(url: string, uuid: string): Promise<string> {
    try {
      return encode(`${url}?uuid=${uuid}`);
    } catch (error) {
      throw new Error('LNURL link generation failed');
    }
  }
}
