const  mysql = require('mysql');
const passwordHash = require('password-hash');

class DataBase {
  constructor() {
    this.pool  = mysql.createPool({
      connectionLimit : 20,
      host            : 'localhost',
      user            : 'root',
      password        : '9675',
      database        : 'tinkoff'
    });

    this.usersTableName = 'users';
  }

  getPool() {
    return this.pool;
  }

  addUser(userLogin=null, userEmail=null, userPassword=null) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `INSERT INTO
                       ${this.usersTableName}(login, email, password)
                         VALUES (
                           "${userLogin}", 
                           "${userEmail}", 
                           "${passwordHash.generate(userPassword)}"
                         )`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve(result.insertId)
        })
      })
    })
  }

  getUserIdByVk(vk = null) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT id
                      FROM ${this.usersTableName}
                        WHERE vk="${vk}"`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }
          if (result.length === 0) {
            resolve(undefined)
          } else {
            resolve(result[0].id)
          }
        })
      })
    })
  }

  addVkUser(login = null, vk = null) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `INSERT INTO
                       ${this.usersTableName}(login, email, password, vk)
                         VALUES (
                           "${login}", 
                           NULL, 
                           NULL,
                           "${vk}"
                         )`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve(result.insertId)
        })
      })
    })
  }

  isUserInDB(userId=null) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT COUNT(*) 
                      FROM ${this.usersTableName} 
                        WHERE id = ${userId}`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve(result[0]['COUNT(*)'])
        })
      })
    })
  }

  getUserLogin(userId) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT login 
                      FROM ${this.usersTableName}
                        WHERE id=${userId}`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve(result[0].login)
        })
      })
    })
  }

  isAuthUser(userLogin=null, userPassword=null) {

    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT COUNT(*) 
                      FROM ${this.usersTableName} 
                        WHERE login="${userLogin}"&&
                          password="${passwordHash.generate(userPassword)}"`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(result)
          }

          resolve(result[0]['COUNT(*)'])
        })
      })
    })
  }

  getUserId(userLogin=null, userPassword=null) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT id, password 
                      FROM ${this.usersTableName}
                        WHERE login="${userLogin}"`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          if (result[0] !== undefined) {
            if (passwordHash.verify(userPassword, result[0].password)) {
              resolve(result[0].id)
            } else {
              resolve(undefined)
            }
          } else {
            resolve(undefined)
          }
        })
      })
    })
  }

  close() {
    this.pool.end(function (err) {
      console.log(err);
      return err;
    });
  }
}

module.exports = new DataBase();
