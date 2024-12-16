/**
 *
 * NOTE: TO BE DEPRECATED
 * TODO: Remove this file
 *
 */
export function generateLnurl(baseUrl: string, withdraw: any): string {
  const params = new URLSearchParams({
    tag: 'withdrawRequest',
    k1: withdraw.k1,
    callback: `${baseUrl}/api/lnurl/withdraw/callback`,
    defaultDescription: withdraw.defaultDescription,
    minWithdrawable: withdraw.minWithdrawable.toString(),
    maxWithdrawable: withdraw.maxWithdrawable.toString(),
  });

  return `lightning:lnurlw://${Buffer.from(
    `${baseUrl}/api/lnurl/withdraw?${params.toString()}`,
  ).toString('base64')}`;
}
