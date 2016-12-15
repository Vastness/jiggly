/**
 * 获取目标用户的待办事项数量
 *
BaseUser user,
String name,
String company,
String mobile,
String districtId,
Integer status,
Integer expertType,
String bids,
String ages,
Integer pageNo,
Integer pageSize,
String filter
 */
module.exports = function(params) {
  if (!params) {
    params = {}
  }
  return function(java) {
    return {
      user: true,
      args: [
        java.String(params.name || null),
        java.String(params.company || null),
        java.String(params.mobile || null),
        java.String(params.districtId || null),
        java.Integer(params.status || null),
        java.Integer(params.expertType || null),
        java.String(params.bids || null),
        java.String(params.ages || null),
        java.Integer(params.pageNo || null),
        java.Integer(params.pageSize || null),
        java.String(params.filter || null),
      ]
    }
  }
}