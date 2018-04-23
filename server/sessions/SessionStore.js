const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

class SessionStore {
  constructor(session, pool) {
    this.session = session;
    this.pool = pool;
  }

  getOptions() {
    return {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'qwerty',
      database: 'tinkoff',
      schema: {
        tableName: 'sessions',
        columnNames: {
          session_id: 'session_id',
          expires: 'session_expires',
          data: 'data'
        }
      }
    };
  }

  getInstance() {
    const sessionStore = new MySQLStore(this.getOptions(), this.pool, () => {

      // Session store callback.
      sessionStore.setExpirationInterval()

    });
    return sessionStore;
  }
}

module.exports = SessionStore;
