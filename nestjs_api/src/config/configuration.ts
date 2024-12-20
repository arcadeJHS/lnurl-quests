export default () => ({
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/lnurl-quests',
  },
  app: {
    host: process.env.HOST || 'http://localhost',
    port: parseInt(process.env.PORT || '3000', 10),
    get baseUrl() {
      return `${this.host}:${this.port}`;
    },
    apiKey: process.env.API_KEY,
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
    },
  },
  lightning: {
    lnbitsUrl: process.env.LNBITS_URL,
    apiKey: process.env.LNBITS_API_KEY,
    maxWithdrawAmount: parseInt(
      process.env.MAX_WITHDRAW_AMOUNT || '1000000',
      10,
    ),
    minWithdrawAmount: parseInt(process.env.MIN_WITHDRAW_AMOUNT || '1000', 10),
  },
});
