const db = require('../../../../bd/DataBase');
function addNewTask(projectId, task) {
  return db.addTask(projectId, task.discription, task.status, task.commentHash)
    .then(
      taskId => {
        return {
          id: taskId,
          discription: task.discription,
          status: task.status
        }
      },
      err => console.log(err)
    )
}

module.exports = addNewTask;
