# Moonlit Postcards · 月光来信

一个可以翻页、拖动插画、许愿、读信并下载纪念票根的静态生日手账。纸张、胶带、花枝和月光构成一张安静的小书桌。

演示人物、日期、信件和故事均为虚构内容。三幅主插画由 AI 从文字提示生成，不使用真人照片。默认无网络 API、无追踪、无账号；所有交互在本机浏览器完成。

## 运行

用任意静态 HTTP 服务打开项目，例如：

```sh
python -m http.server 8000
```

然后访问 `http://localhost:8000`。不需要构建、后端或密钥。

## 自定义

- `content.js`：演示人物、日期、照片卡、信件、故事与愿望。
- `assets/illustrations/`：三幅演示插画。
- `styles.css` 与各模块 CSS：纸张、版式和交互表现。
- `app.js`：章节、许愿与对话框。
- `scrapbook.js`：桌面照片卡片的拖动与翻面。
- `wardrobe.js`：插画选择与拖放。
- `ticket.js`：本机 Canvas 纪念票根导出。
- `audio.js`：用户点击后播放的程序化合成音，不加载录音或第三方音乐。

支持键盘操作、关闭对话框与减少动态效果偏好。保存的画廊选择与声音偏好只在本机 LocalStorage 中；没有上传接口。

发布自己的版本前，检查 `content.js`、图片元数据、截图和 Git 历史。把私密素材放在仓库之外，勿把 `.env`、私钥、聊天记录或个人照片加入仓库。

## 许可

代码与本项目原创 SVG 使用 MIT；演示插画随项目以 MIT 条款提供。字体 ZCOOL KuaiLe 使用 SIL Open Font License，原许可保存在 `assets/fonts/OFL.txt`。AI 生成图片的提示记录见 `ASSETS.md`。
