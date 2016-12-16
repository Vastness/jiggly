/**
 * user
 * Long expertId
 */

module.exports = function(params) {
  if (!params) {
    params = {}
  }
  return function(java) {
    return {
      user: {index: 1},
      args: [
        java.Long(params.expertId || null)
      ]
    }
  }
}