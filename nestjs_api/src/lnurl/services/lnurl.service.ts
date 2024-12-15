import { Injectable } from '@nestjs/common';
import * as lnurl from 'lnurl';

@Injectable()
export class LNURLService {
  async generateLnurlLink(url: string, uuid: string): Promise<string> {
    try {
      return lnurl.encode(`${url}?uuid=${uuid}`);
    } catch (error) {
      throw new Error('LNURL link generation failed');
    }
  }
}
