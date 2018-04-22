const db = require('../../../../bd/DataBase');
function deleteTask(taskId, task) {
  return db.deleteTask(taskId)
    .then(
      result => {
       // console.log(result);

          task.taskId = task.id;
          return db.eventAdd({task: task, action: 'DELETE'}).then(a => {
              return {
                  task: task,
                  event: a
              }
          }, err => console.log(err));
      },
      err => console.log(err)
    )
}

module.exports = deleteTask;
