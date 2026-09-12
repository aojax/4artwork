# 4ART.WORK

让艺术与智能，共同生长。

林奥杰的艺术与人工智能研究实践网站：一个滚动主页，三个独立深度页，统一导航与 Astro 页面转场。

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 品牌主视觉、三条实践路径、AI 奥杰、作品多视角、研究入口、关于与联系 |
| `/csc-art-ai/` | CSC 实验室、AI 奥杰六个工作空间、创作流程、本地任务单、共创计划 |
| `/queyuan/` | 四确方法切换、证据结构、作品档案原则与试点方向 |
| `/deepart/` | 研究准备度交互、知识与比较研究框架、条件式建设路线 |
| `/404.html` | 自定义未找到页面 |

## 已实现与范围

- 响应式布局、手机导航、键盘可用的作品 tabs、四确方法按钮。
- 本地任务单：输入名称、材料与目标，按固定模板整理图文、设计或视频制作任务单，下载 Markdown。
- DeepArt 滑块仅为教学示意，百分比不是实际模型得分或置信度。
- 动态效果可暂停，并尊重系统的减少动画设置。
- 所有作品输入仅在当前页面内存处理，不上传、不持久化；浏览器自身表单恢复行为由浏览器决定。
- 当前没有账号、上传后台、云端 AI 生图、视频生成、自动发布、司法存证或真实估值 API。页面已明确披露。
- 联系按钮打开邮件客户端，不会自动发信。

## 本地开发

Node.js 22.12+（推荐 Node 22 LTS）。

```sh
npm ci
npm run dev
npm run build
npm run preview
```

技术栈：Astro 7.3.2、Tailwind CSS 4、TypeScript。依赖由 `package-lock.json` 锁定。静态内容由 Astro 生成，只有交互和页面转场加载客户端脚本。图片在构建时输出多个尺寸的 WebP，不使用外部字体 CDN。

## 内容维护

三个子页的长文位于 `src/content/research/*.md`，由 `src/content.config.ts` 校验公开状态、作者、更新日期和内容状态。页面文案及结构在 `src/pages/`，共用视觉样式位于 `src/styles/global.css`，行为位于 `src/scripts/site.ts`。

从 Obsidian 发布前，需要移除内部材料、转换双链、确认来源和素材使用范围。不要直接同步整个知识库。机构头衔、合作关系、数据覆盖和商业能力必须有公开依据后再加入。

## PowerShell 发布（Cloudflare Workers 静态托管）

当前发布方式使用已授权的 Cloudflare Workers，将 `dist` 作为静态资源托管。项目配置在 `wrangler.jsonc`，不运行服务端 AI。

```powershell
.\scripts\publish.ps1
```

脚本会依次构建、检查站内链接、发布。默认站点地址为 `https://4artwork.aojax-lin.workers.dev`，规范链接和 sitemap 会随之生成。需要本机 Wrangler 已登录且具备 Workers 发布权限。

以后绑定 `4art.work` 并确认 DNS 与证书生效后，可运行：

```powershell
.\scripts\publish.ps1 -SiteUrl 'https://4art.work'
```

`-SiteUrl` 只控制网页元数据与 sitemap，不会绑定域名。GitHub Actions 当前负责检查构建，不自动发布；无需在仓库保存任何登录凭据。

## Cloudflare Pages（可选迁移方案）

连接 GitHub 的 `aojax/4artwork` 仓库，使用：

- 生产分支：`main`
- 构建命令：`npm run build`
- 输出目录：`dist`
- Node 版本：22
- 项目名称：`4artwork`（以账户内可用名称为准）

Git 集成负责自动部署，GitHub Actions 负责检查与保存构建产物，不配置重复部署。`4art.work` 的域名绑定必须在 Pages 的 Custom domains 完成；修改 `astro.config.mjs` 的 `site` 仅影响规范链接，不会配置 DNS。

如使用手动部署：`npx wrangler pages deploy dist --project-name 4artwork`。手动部署不代表 Git 自动部署已连接。

## 设计与素材

暖白纸感、深绿墨色、朱橙与青瓷色。有机褶皱主视觉配合轻缓呼吸动画。原图与来源说明见 `docs/assets.md`。头像来自作者现有公开个人网站素材。现有个人网站项目未被修改。

## 后续服务接入

云端 AI 工作台宜独立于官网运行，先落实账号、按用途授权、存储、队列、进度、失败恢复及费用展示。可逐步使用 `app.4art.work`，不要在静态客户端暴露服务密钥。优先完整验证真实素材到图文/视频的单条流程。

### Cloudflare Workers Git 自动发布

部署命令使用 `npx wrangler deploy`。仓库的 `wrangler.jsonc` 已配置自动构建与链接检查，部署前会生成 `dist`，无需另设构建命令。PowerShell 发布脚本复用同一流程。

若日志出现 `assets.directory ... dist ... does not exist`，请确认部署使用包含自动构建配置的最新提交，再重试部署。
