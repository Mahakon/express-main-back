const session = require('express-session');
const SessionStore = require('./SessionStore');
const db = require('../bd/DataBase');

class UserSession {
  constructor() {
    this.sessionStore = new SessionStore(session, db.getPool()).getInstance();
  }

  getOptions() {
    return {
      secret: 'tinkoff project',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,
        maxAge: 86400000, //1 day
        httpOnly: true
      },
      store: this.sessionStore,
    }
  }

  getSession() {
    return session(this.getOptions());
  }

  getSessionStore() {
    return this.sessionStore;
  }
}

module.exports = new UserSession();
