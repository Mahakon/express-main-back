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
        //password        : 'qwerty',
        database        : 'tinkoff'
      });

      this.usersTableName = 'users';
      this.projectsTableName = 'project';
      this.conProjectUserTableName = 'project_user';
      this.tasksTableName = 'task';
      this.conTaskProjectTableName = 'task_project';
      this.commentTableName = 'comment';
      this.eventsTableName = 'events';
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

                try {
                  connection.query(SQL, (err, result) => {
                    if (err) {
                      console.error('updateUserPassword', err);
                      reject(err);
                    }
                    if (!result.length) {
                      console.error('updateUserPassword', err);
                      reject(err);
                    }
                    if (passwordHash.generate(old_password), passwordHash.verify(result[0].password)) {
                      reject("Неверный пароль");
                    } else {
                      SQL = `UPDATE ${this.usersTableName} SET password = '${passwordHash.generate(password)}' WHERE id='${userId}'`;
                      connection.query(SQL, (err, result) => {
                        if (err) {
                          console.error('updateUserPassword', err);
                          reject(err);
                        }
                        resolve(true);
                      });
                    }
                    //  console.log(result);
                    resolve(true);
                  })
                } catch (err) {
                  console.log(err.name);
                  console.log(err.message);
                  console.log(err.stack);
                  console.log(err);
                  reject(err);
                }
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
                          WHERE id = ${userId}`;
                  try {
                    connection.query(SQL, (err, result) => {

                      let avatar = result[0].avatar;
                      // console.log(avatar);
                      if (avatar) {
                        fs.unlinkSync(path.join(__dirname, '../../static/public/dist') + avatar);
                      }
                    });
                    SQL = `UPDATE ${this.usersTableName} SET avatar = '${src}'  WHERE id=${userId}`;

                    connection.query(SQL, (err, result) => {
                      if (err) {
                        console.error('updateUserAvatar', err);
                        reject(err)
                      }

                      resolve(true)
                    });
                  } catch (err) {
                    console.log(err.name);
                    console.log(err.message);
                    console.log(err.stack);
                    console.log(err);
                    reject(err);
                  }
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
                try {
                  connection.query(SQL, (err, result) => {
                    if (err) {
                      console.error('updateUserInfo', err);
                      reject(err)
                    }

                    resolve(true)
                  })
                } catch (err) {
                  console.log(err.name);
                  console.log(err.message);
                  console.log(err.stack);
                  console.log(err);
                  reject(err);
                }
            })
        })
    }

    addUser(userLogin=null, userEmail=null, userPassword=null) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
        //   console.log(err);
            reject(err);
          }

          const SQL = `INSERT INTO
                        ${this.usersTableName}(login, email, password)
                          VALUES (
                            "${userLogin}", 
                            "${userEmail}", 
                            "${passwordHash.generate(userPassword)}"
                          )`;
          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //  console.log(err);
                reject(err)
              }

              resolve(result.insertId);
              connection.release();
            })
          } catch (err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    getUserIdByVk(vk = null) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
        //   console.log(err);
            reject(err);
          }

          const SQL = `SELECT id
                        FROM ${this.usersTableName}
                          WHERE vk="${vk}"`;
          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //    console.log(err);
                reject(err)
              }
              if (result.length === 0) {
                resolve(undefined)
              } else {
                resolve(result[0].id)
              }
              connection.release();
            })
          } catch (err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
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

          try {
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
          } catch (err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

  getUserIdByBitbucket(bitbucket) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
       //   console.log(err);
          reject(err);
        }

          const SQL = `SELECT id
                        FROM ${this.usersTableName}
                          WHERE bitbucket="${bitbucket}"`;

        try {
          connection.query(SQL, (err, result) => {
            if (err) {
              //   console.log(err);
              reject(err)
            }
            console.log(result);
            if (result.length === 0) {
              resolve(undefined)
            } else {
              resolve(result[0].id)
            }
            connection.release();
          })
        } catch (err) {
          console.log(err.name);
          console.log(err.message);
          console.log(err.stack);
          console.log(err);
          reject(err);
        }
      })
    })
  }

    addVkUser(login = null, vk = null) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
        //    console.log(err);
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

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //   console.log(err);
                reject(err)
              }

              resolve(result.insertId);
              connection.release();
            })
          } catch (err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    addBitbucketUser(login = null, bitbucket = null, refreshToken = null) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
        //   console.log(err);
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

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //    console.log(err);
                reject(err)
              }

              resolve(result.insertId);
              connection.release();
            })
          } catch (err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    isUserInDB(userId=null) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
        //   console.log('userID', userId);
          if (err) {
        //    console.log(err);
            reject(err);
          }

          const SQL = `SELECT COUNT(*) 
                        FROM ${this.usersTableName} 
                          WHERE id = ${userId}`;

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //     console.log(err);
                reject(err)
              }

              resolve(result[0]['COUNT(*)']);
              connection.release();
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    getUserLogin(userId) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
        //   console.log(err);
            reject(err);
          }

          const SQL = `SELECT login, name, surname, avatar
                        FROM ${this.usersTableName}
                          WHERE id=${userId}`;

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                reject(err);
              }

              console.log('То самое место', userId, result);
              resolve([result[0].login, result[0].name, result[0].surname, result[0].avatar]);
              connection.release();
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
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
                try {
                  connection.query(SQL, (err, result) => {
                    if (err) {
                      //        console.log(err);
                      reject(err);
                    }

                    resolve(!!result.length);
                    connection.release();
                  })
                } catch (err) {
                  console.log(err.name);
                  console.log(err.message);
                  console.log(err.stack);
                  console.log(err);
                  reject(err);
                }
              });
          });
      }
    isAuthUser(userLogin=null, userPassword=null) {

      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
        //   console.log(err);
            reject(err);
          }

          const SQL = `SELECT COUNT(*) 
                        FROM ${this.usersTableName} 
                          WHERE login="${userLogin}"&&
                            password="${passwordHash.generate(userPassword)}"`;

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //    console.log(err);
                reject(result)
              }

              resolve(result[0]['COUNT(*)']);
              connection.release();
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
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
          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //   console.log(err);
                reject(err)
              }

              if (result[0] !== undefined) {
                //   console.log(userPassword,result[0].password);
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
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    addProject(userId, title, acountname, slug, branch) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
          // console.log(err);
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

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //     console.log(err);
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
                  //    console.log(err);
                  reject(err)
                }

                resolve(projectId);
                connection.release();
              })
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    getProjects(userId) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
        //   console.log(err);
            reject(err);
          }

          const SQL = `SELECT p.id, p.title
                        FROM ${this.projectsTableName} p
                          LEFT JOIN ${this.conProjectUserTableName} c
                            ON p.id = c.project_id
                              WHERE c.user_id = ${userId}`;

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //   console.log(err);
                reject(err)
              }

              resolve(result);
              connection.release();
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
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

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                console.log(err);
                reject(err)
              }

              resolve("Number of records deleted: " + result);
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    getTasks(projectId) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
        //    console.log(err);
            reject(err);
          }

          const SQL = `SELECT t.id, t.discription, t.status, t.filename_hash
                        FROM ${this.tasksTableName} t
                          LEFT JOIN ${this.conTaskProjectTableName} c
                            ON t.id = c.task_id and t.delete = "0"
                              WHERE c.project_id = ${projectId}`;

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //   console.log(err);
                reject(err)
              }

              resolve(result);
              connection.release();
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    };

    /*
      Получаем все таски когда либо созданые
    */
    getTasksForEvnts(projectId) {
          return new Promise((resolve, reject) => {
              this.pool.getConnection((err, connection) => {
                  if (err) {
                      //    console.log(err);
                      reject(err);
                  }

          const SQL = `SELECT t.id, t.discription, t.status, t.filename_hash
                        FROM ${this.tasksTableName} t
                          LEFT JOIN ${this.conTaskProjectTableName} c
                            ON t.id = c.task_id
                              WHERE c.project_id = ${projectId}`;

                  try {
                    connection.query(SQL, (err, result) => {
                      if (err) {
                        //   console.log(err);
                        reject(err)
                      }

                      resolve(result);
                      connection.release();
                    })
                  } catch(err) {
                    console.log(err.name);
                    console.log(err.message);
                    console.log(err.stack);
                    console.log(err);
                    reject(err);
                  }
              })
          })
      };

    getComments(taskId) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
        //   console.log(err);
            reject(err);
          }

          const SQL = `SELECT id, task_id, user_id, content
                        FROM ${this.commentTableName}
                          WHERE task_id=${taskId}`;

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                console.log(err);
                reject(err)
              }
              // console.log(result);
              Promise.all(result.map(comment => this.getUserLogin(comment.user_id))).then(userData => {
                  resolve(result.map((comment, index) => {
                      let t = comment;
                      t.event = {};
                      t.event.userData = userData[index];
                      return t;
                  }));
              }).catch(err => {
                  console.log(err);
                  console.log('Какая-то ошибка');
                  resolve(result);
              });
              connection.release();
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
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



          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //     console.log(err);
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
                  //   console.log(err);
                  reject(err)
                }

                resolve(taskId);
                connection.release();
              })
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }
    getEventTask(id){
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
              //      console.log(err);
                    reject(err);
                }
              //   console.log("ID", id);
                const SQL = `SELECT *
                        FROM ${this.eventsTableName}
                              WHERE task_id = "${id}"`;

                try {
                  connection.query(SQL, (err, result) => {
                    if (err) {
                      //      console.log(err);
                      reject(err)
                    }

                    resolve(result);
                    connection.release();
                  })
                } catch(err) {
                  console.log(err.name);
                  console.log(err.message);
                  console.log(err.stack);
                  console.log(err);
                  reject(err);
                }
            })
        })
    }
    eventGet(id_project){
      return new Promise((resolve, reject) => {
          this.getTasksForEvnts(id_project).then(result => {
                  if (result.length) {
                      return Promise.all(result.map(a => this.getEventTask(a.id)));
                  }else{
                      resolve([]);
                  }
              })
              .then(result => {
                  let k = [];
                  result.filter(z => z.length).forEach(ell => ell.forEach(ell1 => k.push(ell1)));
                  Promise.all(k.map(z => z.user_id).map(id => this.getUserLogin(id))).then(r => {
                          const result_arr = k.map((currentValue, index) => {
                              currentValue.userData = r[index];
                              return currentValue;
                          });
                          resolve(result_arr);
                      }
                  );
              })
              .catch(err => reject(err));
      });
    }
    eventAdd(data){
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                }
              //   console.log(data);
                console.log('Пытаюсь создать ивент', data);
                let SQL = `INSERT INTO
                      ${this.eventsTableName}(action, discription, task_id, status, user_id)
                        VALUES (
                              "${data.action}", "${data.task.discription}", "${data.task.taskId}", "${data.task.status}", "${data.task.userId}"
                        )`;
            //      console.log(SQL);
              try {
                connection.query(SQL, (err, result) => {
                  if (err) {
                    //   console.log(err);
                    reject(err)
                  }
                  //    console.log('result', result);
                  return this.getUserLogin(data.task.userId).then(user =>
                    resolve({
                      action: data.action,
                      discription: data.task.discription,
                      taskId: data.task.taskId,
                      status: data.task.status,
                      userId: data.task.userId,
                      userData: user
                    })
                  );

                })
              } catch(err) {
                console.log(err.name);
                console.log(err.message);
                console.log(err.stack);
                console.log(err);
                reject(err);
              }
            })
        })
    }

    addProjectAddUser(code, id) {
      console.log(code);
      return new Promise((resolve, reject) => {

        this.pool.getConnection((err, connection) => {
          if (err) {
            reject(err);
          }
          let SQL = `SELECT id FROM ${this.projectsTableName} WHERE share_link = '${code}'`;
          connection.query(SQL, (err, result) => {
            if (err) {
              reject(err)
            }
            if (result[0].id){
              const SQL = `INSERT INTO
            ${this.conProjectUserTableName}()
              VALUES (
                "${result[0].id}", 
                "${id}"
              )`;

              try {
                connection.query(SQL, (err, result) => {
                  if (err) {
                    reject(err)
                  }

                  resolve(result);
                })
              } catch(err) {
                console.log(err.name);
                console.log(err.message);
                console.log(err.stack);
                console.log(err);
                reject(err);
              }
            }else{
              if (err) {
                reject('ссылка не действительна');
              }
            }
            connection.release();
          });
        });
      });
    }

      /**
       * @description Получаем ссылку для проекта
       * @param project_id
       *
       */
    getStringUrlToShare(project_id){
        return new Promise((resolve,  reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                }
                //Формируем запрос к таблице
                let SQL = `SELECT share_link FROM ${this.projectsTableName} WHERE  id=${project_id}`;
                try {
                  connection.query(SQL, (err, result) => {
                    if (err) {
                      reject(err)
                    }
                    // console.log(result[0].share_link);
                    if (result[0].share_link !== '///')
                      resolve(result[0]);
                    else {
                      this.generateStringUrlToShare(project_id).then(result => {
                        resolve(result);
                        console.log(result);
                      }).catch(err => reject(err));
                    }
                    connection.release();
                  });
                } catch(err) {
                  console.log(err.name);
                  console.log(err.message);
                  console.log(err.stack);
                  console.log(err);
                  reject(err);
                }
            });
        });
    }
    /**
     * @description Генерируеи ссылку
     * Math.random().toString(36).substr(2)
     * Генерируем ссылку и пишем ее а таблицу проектов
     *
     * @param {numer] project_id - id проекта для шаринга
     *
     */
    generateStringUrlToShare(project_id) {
      return new Promise((resolve, reject) => {
          this.pool.getConnection((err, connection) => {
              if (err) {
                  reject(err);
              }
              //Генерируем последовательность
              const code = Math.random().toString(36).substr(2);
              const share_link = "`share_link` = '" + code +"'";
              //Формируем запрос к таблице
              let SQL = `UPDATE ${this.projectsTableName} SET ${share_link} WHERE  id=${project_id}`;
      //       console.log(SQL);
            try {
              connection.query(SQL, (err, result) => {
                if (err) {
                  reject(err)
                }
                resolve(code);
                connection.release();
              });
            } catch (err) {
              console.log(err.name);
              console.log(err.message);
              console.log(err.stack);
              console.log(err);
              reject(err);
            }
          });
      });
    }

      /**
       * @description Получение юзеров в проекте
       * @param {numer] project_id - id проекта для шаринга
       * @returns {Promise<any>}
       */
      getMembers(project_id) {
          return new Promise((resolve, reject) => {
              this.pool.getConnection((err, connection) => {
                  if (err) {
                      reject(err);
                  }
                  let SQL = `SELECT user_id FROM ${this.conProjectUserTableName} WHERE project_id = ${project_id}`;
                  try {
                    connection.query(SQL, (err, result) => {
                      if (err) {
                        reject(err)
                      }

                      Promise.all(result.map(z => z.user_id).map(id => this.getUserLogin(id))).then(r => {
                          const result_arr = result.map((currentValue, index) => {
                            currentValue.userData = r[index];
                            return currentValue;
                          });
                          resolve(result_arr);
                        }
                      );

                      connection.release();
                    });
                  } catch(err) {
                    console.log(err.name);
                    console.log(err.message);
                    console.log(err.stack);
                    console.log(err);
                    reject(err);
                  }
              });
          });
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

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                console.log(err);
                reject(err)
              }

              resolve(result.insertId);
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }


    deleteTask(taskId) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
        //   console.log(err);
            reject(err);
          }

            let SQL = `UPDATE ${this.conTaskProjectTableName} 
                      SET  ` + '`delete`' + `='1' 
                        WHERE task_id=${taskId}`;
          console.log('First', SQL);
          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                // console.log(err);
                reject(err)
              }

              resolve("Number of records deleted: " + result);

              SQL = `UPDATE ${this.tasksTableName} 
                      SET  ` + '`delete`' + `='1' 
                        WHERE id=${taskId}`;
              console.log('Second', SQL);
              connection.query(SQL, (err, result) => {
                if (err) {
                  //    console.log(err);
                  reject(err)
                }

                resolve("Number of records deleted: " + result);
                connection.release();
              })
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    updateTaskDiscription(taskId, taskDiscription) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
          //  console.log(err);
            reject(err);
          }

          let SQL = `UPDATE ${this.tasksTableName} 
                      SET  discription="${taskDiscription}" 
                        WHERE id=${taskId}`;

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //   console.log(err);
                reject(err)
              }

              resolve("Number of records change discription: " + result);
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    updateTaskStatus(taskId, taskStatus) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
          //  console.log(err);
            reject(err);
          }

          let SQL = `UPDATE ${this.tasksTableName} 
                      SET  status="${taskStatus}" 
                        WHERE id=${taskId}`;

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                //    console.log(err);
                reject(err)
              }

              resolve("Number of records change discription: " + result);
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
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

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                console.log(err);
                reject(err)
              }

              resolve("Number of records change discription: " + result);
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
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


          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                console.log(err);
                reject(err)
              }

              if (result[0].acountname === null) {
                resolve(undefined)
              } else {
                resolve(result[0]);
              }
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    addBitbucketToCurAcount(userId, bitbucket, refreshToken) {
      return new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          let SQL = `UPDATE ${this.usersTableName} 
                      SET  bitbucket="${bitbucket}", refresh_token="${refreshToken}" 
                        WHERE id="${userId}"`;

          try {
            connection.query(SQL, (err, result) => {
              if (err) {
                console.log(err);
                reject(err)
              }

              resolve("Number of records change discription: " + result);
            })
          } catch(err) {
            console.log(err.name);
            console.log(err.message);
            console.log(err.stack);
            console.log(err);
            reject(err);
          }
        })
      })
    }

    close() {
      this.pool.end(function (err) {
    //   console.log(err);
        return err;
      });
    }
  }

  module.exports = new DataBase();
