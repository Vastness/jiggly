/**
 * BaseUser user,
 * Long id,
 */

module.exports = function(params) {
  if (!params) {
    params = {}
  }
  return function(java) {
    return {
      user: true,
      args: [
        java.Long(params.id || null),
      ]
    }
  }
}