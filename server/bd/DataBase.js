const  mysql = require('mysql');
const passwordHash = require('password-hash');
var fs = require('fs');
const path = require('path');



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
    this.commentTableName = 'comment';
  }

  getPool() {
    return this.pool;
  }

  updateUserPassword(userId, old_password,  password)  {
      return new Promise((resolve, reject) => {
          this.pool.getConnection((err, connection) => {
              if (err) {
                  console.error('updateUserPassword', err);
                  reject(err);
              }
              let SQL = `SELECT password
                      FROM ${this.usersTableName}
                        WHERE id="${userId}"` ;

              connection.query(SQL, (err, result) => {
                  if (err) {
                      console.error('updateUserPassword', err);
                      reject(err);
                  }
                  if (!result.length){
                      console.error('updateUserPassword', err);
                      reject(err);
                  }
                  if (passwordHash.generate(old_password), passwordHash.verify(result[0].password)) {
                    reject("Неверный пароль");
                  }else{
                      SQL = `UPDATE ${this.usersTableName} SET password = '${passwordHash.generate(password)}' WHERE id='${userId}'` ;
                      connection.query(SQL, (err, result) => {
                          if (err) {
                              console.error('updateUserPassword', err);
                              reject(err);
                          }
                          resolve(true);
                      });
                  }
                  console.log(result);
                  resolve(true);
              })
          })
      })
  }

    updateUserAvatar(userId, src) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    console.error('updateUserAvatar', err);
                    reject(err);
                }
                if (src === null) src = '';
                let SQL = `SELECT avatar 
                      FROM ${this.usersTableName} 
                        WHERE id = ${userId}`; ;
                connection.query(SQL, (err, result) => {

                    let avatar = result[0].avatar;
                    // console.log(avatar);
                    if (avatar) {
                        fs.unlinkSync(path.join(__dirname, '../../static/public/dist') + avatar);
                    }
                });
                 SQL = `UPDATE ${this.usersTableName} SET avatar = '${src}'  WHERE id=${userId}` ;

                connection.query(SQL, (err, result) => {
                    if (err) {
                        console.error('updateUserAvatar', err);
                        reject(err)
                    }

                    resolve(true)
                });
            })
        })
    }

  updateUserInfo(userId, userLogin, name, surname) {
      return new Promise((resolve, reject) => {
          this.pool.getConnection((err, connection) => {
              if (err) {
                  console.error('updateUserInfo', err);
                  reject(err);
              }
              if (name === null) name = '';
              if (surname === null) surname = '';
              const SQL = `UPDATE ${this.usersTableName} SET login = '${userLogin}', name = '${name}', surname = '${surname}'  WHERE id=${userId}` ;

              connection.query(SQL, (err, result) => {
                  if (err) {
                      console.error('updateUserInfo', err);
                      reject(err)
                  }

                  resolve(true)
              })
          })
      })
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

  getBitbucketByUserId(userId = null) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT bitbucket, refresh_token
                      FROM ${this.usersTableName}
                        WHERE id="${userId}"`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }
          if (result.length === 0 || result[0] === null) {
            resolve(undefined)
          } else {
            resolve(result[0])
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

  addBitbucketUser(login = null, bitbucket = null, refreshToken = null) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `INSERT INTO
                       ${this.usersTableName}(login, email, password, vk, bitbucket, refresh_token)
                         VALUES (
                           "${login}", 
                           NULL, 
                           NULL,
                           NULL,
                           "${bitbucket}",
                           "${refreshToken}"
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
          console.log('userID', userId);
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

        const SQL = `SELECT login, name, surname, avatar
                      FROM ${this.usersTableName}
                        WHERE id=${userId}`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve([result[0].login, result[0].name, result[0].surname, result[0].avatar])
        })
      })
    })
  }
  // Првоерка есть ли такие данные
    checkName(name, value) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                   // console.log(err);
                    reject(err);
                }

                const SQL = `SELECT id 
                      FROM ${this.usersTableName} 
                        WHERE ${name} = "${value}"`;
              //  console.log(SQL);
                connection.query(SQL, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }

                    resolve(!!result.length);
                })
            });
        });
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
        //  console.log(err);
          reject(err);
        }

        const SQL = `SELECT id, password 
                      FROM ${this.usersTableName}
                        WHERE login="${userLogin}"`;
      //  console.log(SQL);
        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          if (result[0] !== undefined) {
              console.log(userPassword,result[0].password);
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

  addProject(userId, title, acountname, slug, branch) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        let SQL;
        console.log('acount' + acountname)
        if (acountname !== undefined) {
          SQL = `INSERT INTO
                       ${this.projectsTableName}(title, acountname, slug, branch)
                         VALUES (
                           "${title}",
                           "${acountname}",
                           "${slug}",
                           "${branch}"
                         )`;
        } else {
          SQL = `INSERT INTO
                       ${this.projectsTableName}(title)
                         VALUES (
                           "${title}"
                         )`;
        }

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

  deleteProject(userId, projectId) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        let SQL = `DELETE
                     FROM ${this.conProjectUserTableName}
                       WHERE project_id=${projectId} AND
                         user_id=${userId}`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve("Number of records deleted: " + result);
        })
      })
    })
  }

  getTasks(projectId) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT t.id, t.discription, t.status, t.filename_hash
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

  getComments(taskId) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const SQL = `SELECT id, task_id, user_id, content
                      FROM ${this.commentTableName}
                        WHERE task_id=${taskId}`;

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

  addTask(projectId, taskDiscription, taskStatus, commentHash) {

    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        let SQL;

        if (commentHash !== undefined) {
          SQL = `INSERT INTO
                       ${this.tasksTableName}(discription, status, filename_hash)
                         VALUES (
                           "${taskDiscription}",
                           "${taskStatus}",
                           "${commentHash}"
                         )`;
        } else {
          SQL = `INSERT INTO
                       ${this.tasksTableName}(discription, status)
                         VALUES (
                           "${taskDiscription}",
                           "${taskStatus}"
                         )`;
        }

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

  addComment(comment) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        let SQL = `INSERT INTO
                       ${this.commentTableName}(task_id, user_id, content)
                         VALUES (
                           ${comment.task_id},
                           ${comment.user_id},
                           "${comment.content}"
                         )`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve(result.insertId);
        })
      })
    })
  }


  deleteTask(taskId) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        let SQL = `DELETE
                     FROM ${this.conTaskProjectTableName}
                       WHERE task_id=${taskId}`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve("Number of records deleted: " + result);

          SQL = `DELETE 
                   FROM ${this.tasksTableName}
                     WHERE id=${taskId}`;

          connection.query(SQL, (err, result) => {
            if (err) {
              console.log(err);
              reject(err)
            }

            resolve("Number of records deleted: " + result);
            connection.release();
          })
        })
      })
    })
  }

  updateTaskDiscription(taskId, taskDiscription) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        let SQL = `UPDATE ${this.tasksTableName} 
                     SET  discription="${taskDiscription}" 
                       WHERE id=${taskId}`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve("Number of records change discription: " + result);
        })
      })
    })
  }

  updateTaskStatus(taskId, taskStatus) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        let SQL = `UPDATE ${this.tasksTableName} 
                     SET  status="${taskStatus}" 
                       WHERE id=${taskId}`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve("Number of records change discription: " + result);
        })
      })
    })
  }

  refreshToken(bitbucket, refreshToken) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        let SQL = `UPDATE ${this.usersTableName} 
                     SET  refresh_token="${refreshToken}" 
                       WHERE bitbucket="${bitbucket}"`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          resolve("Number of records change discription: " + result);
        })
      })
    })
  }

  getDataProjectOnBitbucket(projectId) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        let SQL = `SELECT acountname, slug, branch FROM ${this.projectsTableName} 
                     WHERE id="${projectId}"`;

        connection.query(SQL, (err, result) => {
          if (err) {
            console.log(err);
            reject(err)
          }

          if (result[0].acountname === null ) {
            resolve(undefined)
          } else {
            resolve(result[0]);
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
