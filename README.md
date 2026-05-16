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
├── assets/
│   ├── logo.svg        Jodo 图标（同 App 源 SVG）
│   ├── logo.png        Jodo 图标（PNG 兜底）
│   ├── styles.css      全站共用样式
│   ├── screenshots/    任务页 / 专注页 / 统计页 / 我的 截图
│   └── donation/       微信 / 支付宝 收款码 PNG
└── README.md

APK 不在仓库里，发布在 GitHub Releases：
  https://github.com/vulcanen/jodo-site/releases/tag/v<version>
```

## 发布新版本流程

1. 在 Jodo 源码仓库改 `pubspec.yaml` 的 version。
2. 跑 `flutter analyze` + `flutter test` + `flutter build apk --release`，产物在 `build/app/outputs/apk/release/`。
3. 用 `Get-FileHash -Algorithm SHA256 <apk>` 取校验值。
4. 在本仓库改：
   - `index.html` 的版本号 / 文件名 / 大小 / SHA-256 / 下载链接（指向新 tag）
   - `install.html` 的版本号
   - `changelog.html` 顶部加新一节
   - 如有隐私政策变化，同步改 `privacy.html`
5. 提交并 `git push`（自动触发 Cloudflare Pages 重新部署，1-3 分钟）。
6. 用 `gh` 创建 release 并上传 APK：
   ```powershell
   gh release create v<version> `
     --repo vulcanen/jodo-site `
     --title "v<version>" `
     --notes "详见 changelog.html" `
     D:\projects\Jodo\build\app\outputs\apk\release\Jodo-v<version>.apk
   ```
7. 用无痕浏览器验证下载链接和 SHA-256 都对。

> Why 不把 APK 放在仓库里：Cloudflare Pages（含 Workers Static Assets）单文件上限 25 MiB，
> 而我们的 APK 是 61 MiB。Gitee Pages 对个人账号几乎已关停。
> GitHub Releases 每文件 2 GB，是分发二进制的标准做法。

## 资源说明

- `assets/screenshots/{tasks,focus,stats,profile}.png` 由 `scripts/?`（脚本未入库，用 PIL 把原始截图缩到 540 宽）从原图生成。换新截图直接覆盖同名 PNG 即可。
- `assets/donation/{wechat,alipay}.png` 是真实收款码，**不能误覆盖为占位图**。

## 不要做的事

- 不要把 keystore / `key.properties` 放进来
- 不要引第三方统计 / 评论 / 字体（保持「不联网、不收集」承诺一致）
- 不要把 APK 放进仓库（Cloudflare 单文件 25 MiB 上限会卡部署；`.gitignore` 已全局拦截 `*.apk`）
