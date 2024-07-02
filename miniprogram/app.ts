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

    wx.showLoading({
      title: '登陆中',
    })

    // 登录
    wx.login({
      success: (res) => {
        wx.hideLoading()
        console.log("微信服务器登录成功");

        if (res.code) {
          wx.request({
            url: `http://${HOST}/api/note/user/loginFromWx`,
            data: {
              code: res.code
            },
            success: (res) => {
              console.log(res);
              if (res.statusCode !== 200) {
                console.error(res);
                wx.showToast({
                  title: 'note服务器登录失败',
                  icon: 'error',
                  duration: 2000
                })
                return;
              }

              this.globalData.token = res.data.data;

              const pages = getCurrentPages();
              let currentPage = pages[pages.length - 1];
              currentPage.getNotes();
            },
          })
        } else {
          console.log('微信服务器登录失败！' + res.errMsg)
          wx.showToast({
            title: '登录失败',
            icon: 'error',
            duration: 2000
          })
        }
      },
      fail: (err) => {
        console.log(err);
        wx.showToast({
          title: '登录失败',
          icon: 'error',
          duration: 2000
        })
      }
    })
  },
})
