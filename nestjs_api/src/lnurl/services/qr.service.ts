import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QRService {
  async generateQR(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data);
    } catch (error) {
      throw new Error('QR code generation failed');
    }
  }
}