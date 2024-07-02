import moment from 'moment';
import { HOST } from '../../utils/CONSTANT';


interface IPageScrollOption {
  /** 页面在垂直方向已滚动的距离（单位px） */
  scrollTop: number
}

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    windowHeight: 0,

    notes: [],
    openSwipeCellId: "",
    fetchingNotes: false,
  },

  onLoad() {
    // @ts-ignore
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    // this.login(() => {
    //   Toast.success("登录成功");
    //   this.getNotes();
    // });

    const { windowHeight, platform } = wx.getSystemInfoSync()
    this.setData({ windowHeight })
  },
  onShow() {
    console.log("index page show");

    if (getApp().globalData.token === "") {
      return;
    }
    this.getNotes();
  },
  onUnload() {
    console.log("index unload");
  },
  toLogs() {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  onPageScroll(_options: IPageScrollOption) {
    this.closeAllSwipeCell();
  },

  // methods
  getNotes() {
    const promise = new Promise((resolve, _reject) => {
      this.setData({
        fetchingNotes: true,
      });

      wx.request({
        url: `http://${HOST}/api/note/note/findAll`,
        data: {},
        header: {
          'content-type': 'application/json',
          'token': getApp().globalData.token,
        },
        success: (res) => {
          this.setData({
            fetchingNotes: false,
          });
          
          const { data: notes, msg, status } = res.data;

          let list = notes.map((note) => {
            return {
              ...note,
              content: JSON.parse(note.content),
              text: "fake text",
              createTime: moment(note.createTime),
              updateTime: moment(note.updateTime),
              deleteTime: moment(note.deleteTime),
              displayUpdateTime: moment(note.updateTime).format(),
            }
          });

          list.sort((a, b) => {
            return a.number - b.number;
          });

          this.setData({
            notes: list,
          });

          resolve(list);
        }
      });
    });

    return promise;
  },
  addNote() {
    const newId = (new Date()).getTime() + "";

    const newNote = {
      id: newId,
      title: "New Note",
      content: "",
      number: 0,
      createTime: moment(),
      updateTime: moment(),
      username: "zhouyang", // TODO
      deleted: 0,
      active: false,
    }

    let data = {
      ...newNote,
      content: JSON.stringify(newNote.content),
    }

    wx.request({
      url: `http://${HOST}/api/note/note`,
      method: "POST",
      header: {
        'content-type': 'application/json',
        'token': getApp().globalData.token,
      },
      data: data,
      success: async (_res): Promise<void> => {
        await this.getNotes();
        // this.toNoteDetail(newId);
      }
    });
  },
  deleteNote(id: string) {
    wx.request({
      url: `http://${HOST}/api/note/note/${id}`,
      method: "DELETE",
      header: {
        'content-type': 'application/json',
        'token': getApp().globalData.token,
      },
      success: async (res): void => {
        await this.getNotes();

      }
    });
  },
  getUserProfile() {

    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res, 666)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      },
      fail: (aa) => {
        console.log(aa, 'aa');
      },
      complete: (bb) => {
        console.log(bb, 'bb');
      }
    })
  },
  getUserInfo(e: any) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  login(cb: AnyFunction) {
    wx.request({
      method: "POST",
      url: `http://${HOST}/api/note/user/login`,
      data: {
        username: "zhouyang",
        password: "698d51a19d8a121ce581499d7b701668",
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        const { data: token } = res.data;
        let app = getApp();
        app.globalData.token = token;

        cb();
      }
    });
  },
  handleEditNote(event) {
    const noteId = event.currentTarget.dataset.id;
    this.toNoteDetail(noteId);
  },
  handleDeleteNote(event) {
    const noteId = event.currentTarget.dataset.id;
    this.deleteNote(noteId);
  },
  toNoteDetail(noteId: string) {
    let curNote = this.data.notes.find(item => item.id === noteId);

    wx.navigateTo({
      url: "../NoteDetail/NoteDetail",
      success: function (res) {
        res.eventChannel.emit('passTheNote', curNote)
      }
    });
  },
  onSwipeCellOpen(event: any) {
    const id = event.currentTarget.id;
    this.setData({
      openSwipeCellId: id,
    });
  },
  closeAllSwipeCell() {
    // this.selectComponent("#" + this.data.openSwipeCellId + "").close();
  },
})
