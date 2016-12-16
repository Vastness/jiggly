/**
 * BaseUser user,
 * Integer status,
 * Integer type,
 * Integer pageNo,
 * Integer pageSize
 */

module.exports = function(params) {
  if (!params) {
    params = {}
  }
  return function(java) {
    return {
      user: true,
      args: [
        java.Integer(params.status || null),
        java.Integer(params.type || null),
        java.Integer(params.pageNo || null),
        java.Integer(params.pageSize || null)
      ]
    }
  }
}