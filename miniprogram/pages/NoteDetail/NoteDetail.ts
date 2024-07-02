import moment from 'moment';
import Toast from '@vant/weapp/toast/toast';
import { HOST } from '../../utils/CONSTANT';


let timer: number = -1;

Page({
	data: {
		curNote: {},

		formats: {},
		readOnly: false,
		placeholder: '开始输入...',
		editorHeight: 300,
		keyboardHeight: 0,
		isIOS: false
	},

	readOnlyChange() {
		this.setData({
			readOnly: !this.data.readOnly
		})
	},

	onLoad() {
		console.log("detail onload");
		const eventChannel = this.getOpenerEventChannel()

		eventChannel.on('passTheNote', (note) => {
			this.setData({
				curNote: note,
			});
		})


		const platform = wx.getSystemInfoSync().platform
		const isIOS = platform === 'ios'
		this.setData({ isIOS })
		const that = this
		this.updatePosition(0)
		let keyboardHeight = 0

		wx.onKeyboardHeightChange(res => {
			if (res.height === keyboardHeight) return
			const duration = res.height > 0 ? res.duration * 1000 : 0
			keyboardHeight = res.height
			setTimeout(() => {
				wx.pageScrollTo({
					scrollTop: 0,
					success() {
						that.updatePosition(keyboardHeight)
						that.editorCtx.scrollIntoView()
					}
				})
			}, duration)

		})
	},

	onUnload() {
		console.log("NoteDetail unload");
	},

	// methods
	saveNote() {
		const newNote = {
			...this.data.curNote,
			content: JSON.stringify(this.data.curNote.content),
		}

		wx.request({
			url: `http://${HOST}/api/note/note`,
			method: "PUT",
			data: newNote,
			header: {
				'content-type': 'application/json',
				'token': getApp().globalData.token,
			},
			success: (_res) => {
        Toast.success("保存成功");
			}
		});
	},
	debounceSaveNote() {
		clearTimeout(timer);
		timer = setTimeout(() => {
			this.saveNote();
		}, 1000);
	},

	// editor methods
	updatePosition(keyboardHeight) {
		const toolbarHeight = 50
		const { windowHeight, platform } = wx.getSystemInfoSync()
		let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
		this.setData({ editorHeight, keyboardHeight })
	},
	calNavigationBarAndStatusBar() {
		const systemInfo = wx.getSystemInfoSync()
		const { statusBarHeight, platform } = systemInfo
		const isIOS = platform === 'ios'
		const navigationBarHeight = isIOS ? 44 : 48
		return statusBarHeight + navigationBarHeight
	},
	onEditorReady() {
		wx.createSelectorQuery().select('#editor').context((res) => {
			this.editorCtx = res.context

			this.editorCtx.setContents({
				delta: this.data.curNote.content,
			});
		}).exec()
	},
	onEditorInputChange(event: any) {
		let title = "";
		let text = JSON.stringify(event.detail.text);

		let titleCharNum = 30;
		if (text.indexOf("\\n") !== -1 && text.indexOf("\\n") < titleCharNum) {
			// 回车在30个字符以内
			title = text.slice(1, text.indexOf("\\n"));
		} else {
			// 回车在30个字符以外
			title = text.slice(1, titleCharNum);
		}
		if (title.substring(title.length - 1) === "\"") {
			title = title.substring(0, title.length - 1)
		}

		if (title === "") {
			title = "New Note";
		}

		let newNote = {
			...this.data.curNote,
			title: title,
			content: event.detail.delta,
			updateTime: moment(),
		}

		this.setData({
			curNote: newNote,
		});

		this.debounceSaveNote();
	},
	blur() {
		this.editorCtx.blur()
	},
	format(e): void {
		let { name, value } = e.target.dataset
		if (!name) return
		// console.log('format', name, value)
		this.editorCtx.format(name, value)

	},
	insertImage() {
		const that = this

		wx.chooseImage({
			count: 1,
			success: function (res) {
				that.editorCtx.insertImage({
					src: res.tempFilePaths[0],
					data: {
						id: 'abcd',
						role: 'god'
					},
					width: '80%',
					success: function () {
						console.log('insert image success')
					}
				})
			}
		})
	}
})