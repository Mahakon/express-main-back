const db = require('../../../../bd/DataBase');

function updateTaskDiscription(task) {
  return db.updateTaskDiscription(task.id, task.discription)
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

module.exports = updateTaskDiscription;
