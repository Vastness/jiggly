/**
 * user
 * expertId
 */

module.exports = function(expertId) {
  return function(java) {
    return {
      user: {index: 1},
      args: [
        java.Long(expertId || null)
      ]
    }
  }
}