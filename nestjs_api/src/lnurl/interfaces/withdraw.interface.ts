export interface WithdrawResponse {
  lnurl: string;
  qr: string;
  k1: string;
}

export interface LightningPaymentResponse {
  status: string;
  payment_hash?: string;
}