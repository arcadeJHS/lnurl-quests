import { LnurlData } from '../../common/interfaces/lnurl-data.interface';

export interface WithdrawResponse {
  lnurl: string;
  qr: string;
  k1: string;
}

export interface LightningPaymentResponse {
  status: string;
  payment_hash?: string;
}

export interface LNBitsGenerateWithdrawUrlResponse extends LnurlData {}

export interface GenerateWithdraw {
  minWithdrawable: number;
  maxWithdrawable: number;
  defaultDescription: string;
}
