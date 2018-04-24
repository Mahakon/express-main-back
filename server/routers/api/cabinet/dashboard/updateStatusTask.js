const db = require('../../../../bd/DataBase');

function updateStatusTask(task, conn, msg) {
   // console.log('task', conn, msg);
  return db.updateTaskStatus(task.id, task.status)
    .then(
      result => {

          task.taskId = task.id;
          console.log('task' + task);
          if (!task.userId) {
            task.userId = 200;
          }
          return db.eventAdd({task: task, action: 'CHANGE_STATUS'}).then(a => {
              return {
                  task: task,
                  event: a
              }
          }, err => console.log(err));


      },
      err => console.log(err)
    )
}

module.exports = updateStatusTask;
