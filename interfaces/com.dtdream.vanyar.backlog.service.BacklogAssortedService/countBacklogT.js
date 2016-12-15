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
module.exports = function(appT, appTagT, beginTimeT, endTimeT) {
  return function(java) {
    return {
      user: true,
      args: [
        java.String(appT || null),
        java.String(appTagT || null),
        java.Long(beginTimeT || null),
        java.Long(endTimeT || null),
      ]
    }
  }
}