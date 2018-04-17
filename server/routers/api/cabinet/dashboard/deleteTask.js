const db = require('../../../../bd/DataBase');
function deleteTask(taskId) {
  return db.deleteTask(taskId)
    .then(
      result => {
        console.log(result);
        return {
          id: taskId,
        }
      },
      err => console.log(err)
    )
}

module.exports = deleteTask;
