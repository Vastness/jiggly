/**
 * 获取目标用户的待办事项数量
 * @param user 用户对象
 * @param appT 模块或App唯一标示
 * @param appTagT 模块或App子分类标签，可空
 * @param beginTimeT 待办有效期开始时间
 * @param endTimeT 待办有效期结束时间
 * @return 待办事项数量
 *
 *  @Export(paramNames = {"user", "appT", "appTagT", "beginTimeT", "endTimeT"})
    Response<Long> countBacklogT(LoginUser user, String appT, String appTagT, Long beginTimeT, Long endTimeT);
 */
module.exports = function(params) {
  if (!params) {
    params = {}
  }
  return function(java) {
    return {
      user: true,
      args: [
        java.String(params.appT || null),
        java.String(params.appTagT || null),
        java.Long(params.beginTimeT || null),
        java.Long(params.endTimeT || null),
      ]
    }
  }
}