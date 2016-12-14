/**
 * user
 * pageId
 */

module.exports = function(pageId) {
  return function(java) {
    return {
      user: true,
      args: [
        java.String(pageId || 'default')
      ]
    }
  }
}