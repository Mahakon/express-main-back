const  mysql = require('mysql');
const passwordHash = require('password-hash');

class DataBase {
  constructor() {
    this.pool  = mysql.createPool({
      connectionLimit : 99,
      host            : 'localhost',
      user            : 'root',
      password        : '9675',
      database        : 'tinkoff'
    });

    this.usersTableName = 'users';
    this.projectsTableName = 'project';
    this.conProjectUserTableName = 'project_user';
    this.tasksTableName = 'task';
    this.conTaskProjectTableName = 'task_project';
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

          resolve(result.insertId);
          connection.release();
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
          connection.release();
        })
      })
    })
  }

  getUserIdByBitbucket(bitbucket = null) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT id
                      FROM ${this.usersTableName}
                        WHERE bitbucket="${bitbucket}"`;

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
          connection.release();
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

          resolve(result.insertId);
          connection.release();
        })
      })
    })
  }

  addBitbucketUser(login = null, bitbucket = null) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `INSERT INTO
                       ${this.usersTableName}(login, email, password, vk, bitbucket)
                         VALUES (
                           "${login}", 
                           NULL, 
                           NULL,
                           NULL,
                           "${bitbucket}"
                         )`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve(result.insertId);
          connection.release();
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

          resolve(result[0]['COUNT(*)']);
          connection.release();
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

          resolve(result[0].login);
          connection.release();
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

          resolve(result[0]['COUNT(*)']);
          connection.release();
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
          connection.release();
        })
      })
    })
  }

  addProject(userId, title) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        let SQL = `INSERT INTO
                       ${this.projectsTableName}(title)
                         VALUES (
                           "${title}"
                         )`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          const projectId = result.insertId;
          resolve(result.insertId);

          SQL = `INSERT INTO
                     ${this.conProjectUserTableName}(project_id, user_id)
                       VALUES (
                         ${projectId},
                         ${userId} 
                       )`;

          connection.query(SQL, (err, result) => {
            if (err) {
              console.log(err);
              reject(err)
            }

            resolve(projectId);
            connection.release();
          })
        })
      })
    })
  }

  getProjects(userId) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT p.id, p.title
                      FROM ${this.projectsTableName} p
                        LEFT JOIN ${this.conProjectUserTableName} c
                          ON p.id = c.project_id
                            WHERE c.user_id = ${userId}`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve(result);
          connection.release();
        })
      })
    })
  };

  getTasks(projectId) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT t.id, t.discription, t.status
                      FROM ${this.tasksTableName} t
                        LEFT JOIN ${this.conTaskProjectTableName} c
                          ON t.id = c.task_id
                            WHERE c.project_id = ${projectId}`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve(result);
          connection.release();
        })
      })
    })
  };

  addTask(projectId, taskDiscription, taskStatus) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        let SQL = `INSERT INTO
                       ${this.tasksTableName}(discription, status)
                         VALUES (
                           "${taskDiscription}",
                           "${taskStatus}"
                         )`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          const taskId = result.insertId;
          resolve(result.insertId);

          SQL = `INSERT INTO
                     ${this.conTaskProjectTableName}(task_id, project_id)
                       VALUES (
                         ${taskId},
                         ${projectId} 
                       )`;

          connection.query(SQL, (err, result) => {
            if (err) {
              console.log(err);
              reject(err)
            }

            resolve(projectId);
            connection.release();
          })
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
