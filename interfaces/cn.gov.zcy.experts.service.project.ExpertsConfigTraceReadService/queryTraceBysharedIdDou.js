/**
 * Long shareId,Integer type
 */

module.exports = function(params) {
  if (!params) {
    params = {}
  }
  return function(java) {
    return {
      user: false,
      args: [
        java.Long(params.shareId || null),
        java.Integer(params.type || null)
      ]
    }
  }
}