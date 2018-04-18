const db = require('../../../../bd/DataBase');
function addCommentTask(comment) {
  return db.addComment(comment)
    .then(
      commentId => {
        return {
          id: commentId,
          task_id: comment.task_id,
          user_id: comment.user_id,
          content: comment.content
        }
      },
      err => console.log(err)
    )
}

module.exports = addCommentTask;
