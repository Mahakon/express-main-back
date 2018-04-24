const db = require('../../../../bd/DataBase');
function addCommentTask(comment, task) {
  console.log('Пытаюсь поймать тут', task);
  return db.addComment(comment)
    .then(
      commentId => {
        return db.eventAdd({task: task, action: 'ADD_COMMENT'}).then(a => {
          console.log('adada', a);
          return {
            id: commentId,
            task_id: comment.task_id,
            user_id: comment.user_id,
            content: comment.content,
            event: a
          }
      }, err => console.log(err));
        
      },
      err => console.log(err)
    )
}

module.exports = addCommentTask;
