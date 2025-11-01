<br />
<p align="center">
    <img src="https://github.com/iAJue/MoeKoeMusic/raw/main/images/logo.png" alt="Logo" width="156" height="156">
  <h2 align="center" style="font-weight: 600">MoeKoe Music</h2>

  <p align="center">
    一款开源简洁高颜值的酷狗第三方客户端
    <br />
    <a href="https://github.com/iAJue/MoeKoeMusic/" target="blank"><strong>🌎 GitHub仓库</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="https://github.com/iAJue/MoeKoeMusic/releases" target="blank"><strong>📦️ 下载安装包</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="https://MoeJue.cn" target="blank"><strong>💬 访问博客</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="https://Music.MoeKoe.cn" target="blank"><strong>🏠 项目主页</strong></a>
  </p>
  <p align="center">
    <a href="https://github.com/iAJue/MoeKoeMusic/README.md" target="blank"><strong>🇨🇳 简体中文</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="https://github.com/iAJue/MoeKoeMusic/blob/main/docs/README_tw.md" target="blank"><strong>🇨🇳 繁体中文</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="https://github.com/iAJue/MoeKoeMusic/blob/main/docs/README_ja.md" target="blank"><strong>🇯🇵 日本語</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="https://github.com/iAJue/MoeKoeMusic/blob/main/docs/README_en.md" target="blank"><strong>🇺🇸 English</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="https://github.com/iAJue/MoeKoeMusic/blob/main/docs/README_ko.md" target="blank"><strong>🇰🇷 한국어</strong></a>
    <br />
    <br />
  </p>
</p>

![images](https://github.com/LFRon/LFRon-File/raw/main/MoeKoe_Music/Initial-D-3.png)

## ❤️ 前言
MoeKoe Music官方主仓库链接: https://github.com/MoeKoeMusic/MoeKoeMusic

这是一个抢先测试主要特供给Linux发行版(其实只是在Linux上测试过)的代码分支,所有Node依赖全部升级至最新版本,使用Electron 39@beta版本,确保在Wayland下可以调用原生渲染能力而非走XWayland


## ✨ 特性

- ✅ 使用 Vue.js 全家桶开发
- 🔴 酷狗账号登录（扫码/手机/账号登录）
- 📃 支持歌词显示
- 📻 每日推荐歌曲
- 🚫🤝 无任何社交功能
- 🔗 官方服务器直连, 无任何第三方 API
- 🎨 主题色切换 
- 👋 启动问候语
- ⚙️ 多平台支持
- 🛠 更多特性开发中

## 📢 Todo List
- [ ] 📺 支持 MV 播放
- [x] 🌚 Light/Dark Mode 自动切换
- [x] 👆 支持 Touch Bar
- [x] 🖥️ 支持 PWA，可在 Chrome/Edge 里点击地址栏右边的 ➕ 安装到电脑
- [ ] 🟥 支持 Last.fm Scrobble
- [ ] 🎧 支持 Mpris
- [x] ⌨️ 全局快捷键
- [x] 🤟 多语言支持
- [x] 📻 桌面歌词
- [x] ⚙️ 系统架构优化
- [x] 🎶 歌曲、歌单/收藏、取消

更新日志请查看 [Commits](https://github.com/iAJue/MoeKoeMusic/commits/main/)

## 📦️ 安装

### 1. 客户端安装

访问本项目的 [Releases](https://github.com/iAJue/MoeKoeMusic/releases) 页面下载安装包。

### 2. WEB端安装（docker）

* 注意：部署后请开放服务器对应端口才可使用，或者使用反向代理实现域名访问。

    1. 方式一：快速启动（推荐）

    ```
    git clone https://github.com/iAJue/MoeKoeMusic.git
    cd MoeKoeMusic
    docker compose up -d &
    ```

    2. ~~方式二：使用docker-compose一键安装 （镜像暂未上传官方）~~
    
    ```
    docker run -d --name MoeKoeMusic -p 8080:8080 iajue/moekoe-music:latest
    ```

    3. 方式三：宝塔容器编排

    * 远程镜像，版本可能会落后于官方
    
    ```
    version: '3.3'
    
    services:
      moekoe-music:
        # 镜像地址
        image: registry.cn-wulanchabu.aliyuncs.com/youngxj/moekoe-music:latest
        container_name: moekoe-music # 容器名
        restart: unless-stopped # 自动重启
        build:
          context: .
          dockerfile: Dockerfile
        ports: # 端口映射
          - "8080:8080"  # 前端服务
          - "6521:6521"  # 接口服务
    
    ```
    
    复制内容上面的内容，粘贴到宝塔面板的容器编排里面，编排名称为MoeKoeMusic，点击部署即可。

### 3. 一键部署
[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?template=https://github.com/iAJue/moekoemusic&install-command=npm%20install&output-directory=dist&root-directory=.%2F&build-command=npm%20run%20build&env=VITE_APP_API_URL)

需在环境变量(VITE_APP_API_URL)中填写自己的API地址

## ⚙️ 如何开发并导出安装包

1. 克隆本仓库

```sh
git clone https://github.com/iAJue/MoeKoeMusic.git
```

2. 进入目录并安装依赖

```sh
cd MoeKoeMusic
npm run install-all
```
3. 启动开发者模式
```sh
npm run dev
```
4. 打包项目
```sh
npm run build
```
5. 编译项目
  - Windows: 
  ```sh
  npm run electron:build:win [默认 NSIS 安装包]
  ```
  -	Linux: 
    -	x86-64 架构: `npm run electron:build:linux [仅生成 AppImage 安装包]`
    -	ARM64 架构: `npm run electron:build:linux-aarch64 [仅生成 AppImage 安装包]`

  -	macOS: 
  ```sh
  npm run electron:build:macos [默认 macOS 双架构]
  ```


更多命令请查看 `package.json` 文件 `scripts` 

## ⭐ 支持项目

如果您觉得这个项目对您有帮助，欢迎给我们一个 Star！您的支持是我们持续改进的动力。

[![GitHub stars](https://img.shields.io/github/stars/iAJue/MoeKoeMusic.svg?style=social&label=Star)](https://github.com/iAJue/MoeKoeMusic)

## ✅ 反馈

如有任何问题或建议，欢迎提交 issue 或 pull request。

## ⚠️ 免责声明
0. 本程序是酷狗第三方客户端，并非酷狗官方，需要更完善的功能请下载官方客户端体验.
1. 本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为及非法用途！
2. 使用本项目的过程中可能会产生版权数据。对于这些版权数据，本项目不拥有它们的所有权。为了避免侵权，使用者务必在 24 小时内清除使用本项目的过程中所产生的版权数据。
3. 由于使用本项目产生的包括由于本协议或由于使用或无法使用本项目而引起的任何性质的任何直接、间接、特殊、偶然或结果性损害（包括但不限于因商誉损失、停工、计算机故障或故障引起的损害赔偿，或任何及所有其他商业损害或损失）由使用者负责。        
1. 禁止在违反当地法律法规的情况下使用本项目。对于使用者在明知或不知当地法律法规不允许的情况下使用本项目所造成的任何违法违规行为由使用者承担，本项目不承担由此造成的任何直接、间接、特殊、偶然或结果性责任。    
2. 音乐平台不易，请尊重版权，支持正版。
3. 本项目仅用于对技术可行性的探索及研究，不接受任何商业（包括但不限于广告等）合作及捐赠。
4. 如果官方音乐平台觉得本项目不妥，可联系本项目更改或移除。
            

## 📜 开源许可

本项目仅供个人学习研究使用，禁止用于商业及非法用途。

基于 [GNU General Public License v2.0 (GPL-2.0)](https://github.com/iAJue/MoeKoeMusic/blob/main/LICENSE) 许可进行开源。

## 👍 灵感来源

API 源代码来自 [MakcRe/KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi) 
(为了不破坏原项目的结构和后期更新迭代方便,API未做高度集成.~~其实是图省事~~)

- [Apple Music](https://music.apple.com)
- [YouTube Music](https://music.youtube.com)
- [YesPlayMusic](https://github.com/qier222/YesPlayMusic)
- [酷狗音乐](https://kugou.com/)

## 🖼️ 截图

![image](https://github.com/LFRon/LFRon-File/raw/main/MoeKoe_Music/Home-Page.png)

![image](https://github.com/LFRon/LFRon-File/raw/main/MoeKoe_Music/PHONK-1.png)
![image](https://github.com/LFRon/LFRon-File/raw/main/MoeKoe_Music/Initial-D-1.png)
![image](https://github.com/LFRon/LFRon-File/raw/main/MoeKoe_Music/Search-Page.png)
![image](https://github.com/LFRon/LFRon-File/raw/main/MoeKoe_Music/MF-Ghost.png)


## 🗓️ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=iAJue/MoeKoeMusic&type=Date)](https://www.star-history.com/#iAJue/MoeKoeMusic&Date)
