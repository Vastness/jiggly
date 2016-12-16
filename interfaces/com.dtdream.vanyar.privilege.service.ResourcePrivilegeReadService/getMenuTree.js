/**
 * user
 * pageId
 */

module.exports = function(params) {
  if (!params) {
    params = {}
  }
  return function(java) {
    return {
      user: true,
      args: [
        java.String(params.pageId || 'default')
      ]
    }
  }
}