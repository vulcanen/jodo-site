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
├── assets/
│   ├── logo.svg        Jodo 图标（同 App 源 SVG）
│   ├── logo.png        Jodo 图标（PNG 兜底）
│   ├── styles.css      全站共用样式
│   └── screenshots/    任务页 / 专注页 / 统计页 / 我的 截图
└── README.md
```

## 发布新版本流程

1. 在 Jodo 源码仓库改 `pubspec.yaml` 的 version。
2. 跑 `flutter analyze` + `flutter build apk --release`，产物在 `build/app/outputs/apk/release/`。
3. 用 `Get-FileHash -Algorithm SHA256 <apk>` 取校验值。
4. 上传 APK 到阿里云盘的 `Jodo Releases/v<version>/`，拿到分享链接。
5. 在本仓库改：
   - `index.html` 的版本号 / 文件名 / 大小 / SHA-256 / 阿里云盘链接
   - `install.html` 的版本号
   - `changelog.html` 顶部加新一节
   - 如有隐私政策变化，同步改 `privacy.html`
6. 提交并 `git push`。
7. 在 Gitee Pages 后台点「更新」让线上版本刷新。
8. 用无痕浏览器验证一次。

## 占位符（首次发布前必须替换）

全站搜索 `TODO_REPLACE_` 把以下值填进去：

- `TODO_REPLACE_SIZE` — APK 文件大小（如 `25.4 MB`）
- `TODO_REPLACE_SHA256` — SHA-256 校验值
- `TODO_REPLACE_ALIYUN_URL` — 阿里云盘分享链接
- `TODO_REPLACE_FEEDBACK_EMAIL` — 联系邮箱

## 不要做的事

- 不要把 APK 文件 commit 进这个仓库（二进制让仓库膨胀；用阿里云盘）
- 不要把 keystore / `key.properties` 放进来
- 不要引第三方统计 / 评论 / 字体（保持「不联网、不收集」承诺一致）
