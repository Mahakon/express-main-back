const db = require('../../../../bd/DataBase');

function updateStatusTask(task) {
  return db.updateTaskStatus(task.id, task.status)
    .then(
      result => {
        console.log(result);
        return {
          task: task,
        }
      },
      err => console.log(err)
    )
}

module.exports = updateStatusTask;
