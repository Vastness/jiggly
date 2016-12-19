
module.exports = {
  "com.dtdream.vanyar.privilege.service.ResourcePrivilegeReadService": {
    /**
     * 获取目标用户的待办事项数量
     */
    getEnvHref: function() {
      return function(java) {
        return {
          user: false
        }
      }
    },

    /**
     * user
     * pageId
     */
    getMenuTree: function(params) {
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
  },
  "cn.gov.zcy.experts.service.ExpertReadService": {
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
    pagingExperts: function(params) {
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
    },

    /**
     * user
     * Long expertId
     */
    queryExpertInfo4Modify: function(params) {
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

  },
  "cn.gov.zcy.experts.service.project.ExpertsConfigTraceReadService": {
    /**
     * Long shareId,
     * Integer type
     */
    queryTraceBysharedIdDou: function(params) {
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
  },

  "cn.gov.zcy.experts.service.ShareReadService": {
    /**
     * BaseUser user,
     * Long id,
     */
    queryOneShare: function(params) {
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
    },

    /**
     * BaseUser user,
     * Integer status,
     * Integer type,
     * Integer pageNo,
     * Integer pageSize
     */
    queryShare: function(params) {
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

  },

  "com.dtdream.vanyar.backlog.service.BacklogAssortedService": {
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
    countBacklogT:function(params) {
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
  }
}