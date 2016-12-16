/**
 * Long shareId,Integer type
 */

module.exports = function(shareId, type) {
  return function(java) {
    return {
      user: false,
      args: [
        java.Long(shareId || null),
        java.Integer(type || null)
      ]
    }
  }
}