const db = require('../../../../bd/DataBase');

function updateTaskDiscription(task) {
  return db.updateTaskDiscription(task.id, task.discription)
    .then(
      result => {
      //  console.log(result);
          task.taskId = task.id;
          return db.eventAdd({task: task, action: 'CHANGE_DISCRIPTION'}).then(a => {
              return {
                  task: task,
                  event: a
              }
          }, err => console.log(err));
      },
      err => console.log(err)
    )
}

module.exports = updateTaskDiscription;
