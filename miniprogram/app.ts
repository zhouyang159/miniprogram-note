import Toast from "./miniprogram_npm/@vant/weapp/toast/toast";
import { HOST } from "./utils/CONSTANT";


// app.ts
App<IAppOption>({
  globalData: {
    token: "",
  },

  data: {
  },

  onLaunch() {
    console.log("app onLaunch");
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: (res) => {
        console.log("微信服务器登录成功");
        if (res.code) {
          console.log(res, 222);
          wx.request({
            url: `http://${HOST}/api/note/user/loginFromWx`,
            data: {
              code: res.code
            },
            success: (res) => {
              console.log(res);
              if (res.statusCode !== 200) {
                console.error(res);
                Toast.fail("note服务器登录失败");
                return;
              }

              this.globalData.token = res.data.data;

              const pages =  getCurrentPages();
              let currentPage = pages[pages.length - 1];
              currentPage.getNotes();
            },
          })
        } else {
          console.log('微信服务器登录失败！' + res.errMsg)
          Toast.fail("登录失败");
        }
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
})
