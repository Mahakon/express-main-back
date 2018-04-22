const db = require('../../../../bd/DataBase');
function addNewTask(projectId, task) {
  return db.addTask(projectId, task.discription, task.status, task.commentHash)
    .then(
      taskId => {
        console.log(taskId);
          task.taskId = taskId;
          if (!task.userId) {
            task.userId = 196;
          }
          return db.eventAdd({task: task, action: 'ADD'}).then(a => {
              return {
                  id: taskId[0] ? taskId[0] : taskId,
                  discription: task.discription,
                  status: task.status,
                  event: a
              }
          }, err => console.log(err));
      },
      err => console.log(err)
    )
}

module.exports = addNewTask;
