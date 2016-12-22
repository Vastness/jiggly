# Node Web Container

## requirements

- nodejs: ~0.10 (with npm)

## usage

First, install zcyjiggly use git repo url or local path.

`npm install -g zcyjiggly`

Second, run it.

`jiggly`

help:

`jiggly -h`

## config

zcyjiggly can accept a config file named `jiggly.json` under the work path.

### options

All options has default value below:

    {
      "serverPort": 3000,
      "filesHome": "public",
      "viewsHome": "public/views",
      "componentsHome": "public/components",
      "dataFiles": [],
      "extraHelpers": [],
      "oldMode": false,
      "pageMode": false,
      "assetsPrefix": "/lunatone",
      "dubbo": {
        "base": "https://120.27.160.167/ZCY/zcy-web-lib/raw/master/jiggly-dubbos/index.js",
        "extra": "test/dubbo.js"
      },
      "proxy": {
        "domain": "http://dev.internal",
        "uaa": {
          "port": 18081,
          "apis": []
        },
        "middle": {
          "port": 8088,
          "apis": [
            "/api/zoss/getSTSToken",
            "/api/zoss/getDownLoadUrl",
            "/api/district/getDistrictTree",
            "\\/api\\/address\\/\\d+\\/children"
          ]
        },
        "expert": {
          "port": 8010,
          "apis": [
            "\\/zcy\\/experts\\/*",
            "\\zcy\\/opinions\\/*",
            "\\zcy\\/share\\/*"
          ]
        }
      },
      "proxyAuth": {
        "name": "test7@test.com",
        "password": "test123456"
      }
    }

The config file (`jiggly.json`) can include multiple option groups. Depend on env variable `NODE_ENV`, one group will be loaded.

- dubbo： 如果需要调用服务器dubbo渲染页面数据。由于java函数参数必须匹配，所以需要针对部分函数进行参数处理。

  `base`为默认的接口参数转换。

  `extra`为本地填写，如果base配置项没有的接口，需要在本地添加。希望定期能同步到base，这样不用到处写。

  如果dubbo接口只要LoginUser对象，则不需要添加，其他的均需要。

  如果日志中出现`pls check ....`时请配置。

  ```js
  // 接口配置如下
  module.exports = {
    // 要求service的全路径
    "com.dtdream.vanyar.privilege.service.ResourcePrivilegeReadService": {
      /**
      * 获取目标用户的待办事项数量
      */
      getEnvHref: function() {
        // 其中java对象为require('js-to-java')，可查看文档https://github.com/node-modules/js-to-java
        return function(java) {
          return {
            user: false
          }
        }
      },
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
    }
  }
  ```

- proxyAuth：登陆的用户名和密码

- proxy：http请求的配置，可以直接本地代理到服务器，支持正则通配

ex:

    {
      filesHome: "public",
      "env": {
        "dev": {
          "serverPort": 8081
        },
        "prod": {
          "serverPort": 80
        }
      }
    }

All unset options will use the default value.

## Handlerbars Helpers

- equals

  ```{{#equals 1 1}}1{{else}}0{{/equals}}```

- lt

  ```{{#lt a 1}}a{{else}}1{{/lt}}```

- gt

  ```{{#gt a 1}}a{{else}}1{{/gt}}```

- and

  ```{{#and true true}}ab{{else}}0{{/and}}```

- neither

  ```{{#neither false false}}1{{else}}0{{/neither}}```

- mod

  ```{{#mod "a" "b"}}a{{else}}b{{/mod}}```

- of

  ```{{#of 1 "1,2,3"}}a{{else}}b{{/of}}```

- formatDate

  ```
  {{formatDate a "day"}}

  {{formatDate a "minute"}}

  {{formatDate a "YYYY-MM-DD HH:mm:ss"}}
  ```

- json

  ```{{json this}}```

- size

  ```
  {{size a}}

  {{#gt (size a) 1}}{{/gt}}
  ```

- ifCond -- 条件判断

  ```
  {{#ifCond a "==" b}}1{{else}}0{{/ifCond}}

  {{#ifCond a "==" b}}1{{else}}0{{/ifCond}}
  ```

- or -- 或运算

  ```{{#or true null false}}1{{else}}0{{/or}}```

- add -- 加法

  ```{{add 1 2}}```

- subtract -- 减法

  ```{{subtract 2 1}}```

- divide -- 除法

  ```{{divide 4 2}}```

- multiply -- 乘法

  ```{{multiply 2 3}}```


## Mock Data

Write a `.js` file and setting the option `dataFiles` to point to it.

The data file may like below:

```js
    module.exports = {
      urls: {
        // params 为req.query
        "/api/test1": function(params, res) {
          return {
            data1: params.p1,
            data2: params.p2
          };
        },
        "/api/test2": {
          // 支持多种请求
          get: function(params, res) {
            return {a: 1};
          },
          post: function(params, res) {
            return 1;
          },
          delete: {result: true}
        }
      },
      comps: {
        // params 为component的传参
        "/zcy/test": function(params) {
          return {
            data1: params.key
          }
        },
        "/zcy/test2": {
          data2: "111"
        },
        "/zcy/test3": {
          id: 1,
          // 作为多个services的传值
          _SERVICES_: {
            _USER_: {
              name: "test"
            },
            _DETAIL: {
              desc: "testDesc"
            }
          }
        }
      },
      // 全局注入的值，在component中写入
      globals: {
        _USER_: {
          userId: 111,
          category: "01"
        }
      }
    }
```

####DEBUG

DEBUG=zcyjiggly:*
