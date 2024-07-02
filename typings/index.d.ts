/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo;
    token: String;
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback;

  data: Object;
}