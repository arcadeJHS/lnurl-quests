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

export interface LNBitsLnurlData extends LnurlData {}

export interface GenerateWithdraw {
  minWithdrawable: number;
  maxWithdrawable: number;
  defaultDescription: string;
}

export interface WithdrawParamsResponse {
  tag: string;
  k1: string;
  callback: string;
  maxWithdrawable: number;
  minWithdrawable: number;
  defaultDescription: string;
}
