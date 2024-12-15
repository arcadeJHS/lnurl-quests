db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'lnurl_user',
  pwd: process.env.MONGO_APP_PASSWORD || 'lnurl_password',
  roles: [
    {
      role: 'readWrite',
      db: 'lnurl-quests'
    }
  ]
});