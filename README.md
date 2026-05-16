# jodo-site

Jodo 官网静态资源仓库。通过 Gitee Pages 托管：`https://vulcanen.gitee.io/jodo-site/`

> 注意：此仓库**只放静态网页和展示素材**，不放源码、不放 keystore、不放 `key.properties`。

## 目录

```
jodo-site/
├── index.html          首页（介绍 / 卖点 / 截图 / 下载入口）
├── install.html        Android APK 安装说明
├── privacy.html        隐私政策（与 App 内同步）
├── changelog.html      版本更新日志
├── support.html        支持作者 / 打赏页（与 App 内同步）
├── release/            APK 分发目录（Gitee Pages 直接服务）
│   └── Jodo-v1.0.0.apk
├── assets/
│   ├── logo.svg        Jodo 图标（同 App 源 SVG）
│   ├── logo.png        Jodo 图标（PNG 兜底）
│   ├── styles.css      全站共用样式
│   ├── screenshots/    任务页 / 专注页 / 统计页 / 我的 截图
│   └── donation/       微信 / 支付宝 收款码 PNG
└── README.md
```

## 发布新版本流程

1. 在 Jodo 源码仓库改 `pubspec.yaml` 的 version。
2. 跑 `flutter analyze` + `flutter test` + `flutter build apk --release`，产物在 `build/app/outputs/apk/release/`。
3. 用 `Get-FileHash -Algorithm SHA256 <apk>` 取校验值。
4. 把新 APK 复制到本仓库 `release/Jodo-v<version>.apk`（老 APK 同时移除，避免 git 历史膨胀；用户能从更新日志回看版本号）。
5. 在本仓库改：
   - `index.html` 的版本号 / 文件名 / 大小 / SHA-256 / 下载链接路径
   - `install.html` 的版本号
   - `changelog.html` 顶部加新一节
   - 如有隐私政策变化，同步改 `privacy.html`
6. 提交并 `git push`。
7. 在 Gitee Pages 后台点「更新」让线上版本刷新（注意 APK 一并部署，可能比平时多几秒）。
8. 用无痕浏览器验证下载链接和 SHA-256 都对。

> Why 不用阿里云盘：阿里云盘不允许公开分享 APK 类型文件，分享链接最多 1 天有效，不适合长期分发。
> 后续如果 jodo-site 单仓库尺寸超 100 MB，可改用 [Gitee Releases](https://gitee.com/help/articles/4291)（按 tag 附二进制，不进 git 历史）。

## 资源说明

- `assets/screenshots/{tasks,focus,stats,profile}.png` 由 `scripts/?`（脚本未入库，用 PIL 把原始截图缩到 540 宽）从原图生成。换新截图直接覆盖同名 PNG 即可。
- `assets/donation/{wechat,alipay}.png` 是真实收款码，**不能误覆盖为占位图**。

## 不要做的事

- 不要把 keystore / `key.properties` 放进来
- 不要引第三方统计 / 评论 / 字体（保持「不联网、不收集」承诺一致）
- 不要在 `release/` 之外放 APK；`.gitignore` 默认拦截，避免误 commit 调试包
