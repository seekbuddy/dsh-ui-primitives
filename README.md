# dsh-ui-primitives

> [落地页](https://resetsix.github.io/dsh-ui-primitives/) · [官方文档](https://resetsix.github.io/dsh-ui-primitives/docs/) · [npm](https://www.npmjs.com/package/dsh-ui-primitives) · [GitHub](https://github.com/resetsix/dsh-ui-primitives)

独立发布的 React 组件库，同步 DeepSeek Harness Web UI primitives 与五份 `--dsw-*` 主题样式，不依赖 Cordis。`0.2.0` 对齐官方 `dsh-v0.1.2-alpha.3`，支持 React 18 和 React 19。

## 安装

```sh
npm install dsh-ui-primitives
```

peer dependencies：`react ^18.2.0 || ^19.0.0`、`react-dom ^18.2.0 || ^19.0.0`。

## 快速开始

在应用的全局样式入口导入 tokens。使用数学公式时还必须显式导入 KaTeX 样式：

```tsx
import 'dsh-ui-primitives/tokens.css'
import 'dsh-ui-primitives/katex.css'

import { Button, Pill } from 'dsh-ui-primitives'
import { MarkdownText } from 'dsh-ui-primitives/markdown'
import { IconCheckOutline16 } from 'dsh-ui-primitives/icons'
import { setThemePreference } from 'dsh-ui-primitives/theme'

const labels = {
  code: { copyLabel: '复制', copiedLabel: '已复制' },
  footnotes: '脚注',
}

export function Example() {
  return (
    <div>
      <Button variant="primary" onClick={() => setThemePreference('dark')}>
        <IconCheckOutline16 /> 深色主题
      </Button>
      <Pill active>已启用</Pill>
      <MarkdownText text={'公式：$x^2$'} labels={labels} />
    </div>
  )
}
```

组件 CSS Modules 会随对应 JS 入口注入。`tokens.css` 和 `katex.css` 是全局 CSS，应由应用只导入一次。Markdown 不会隐式加载 KaTeX CSS。

## 公开入口

| 入口 | 内容 |
| --- | --- |
| `dsh-ui-primitives` | Button、Pill、Input、Menu、Modal、Tooltip、ConnectionIndicator、定位 hooks 等轻量 primitives 与通用工具 |
| `dsh-ui-primitives/blocks` | TerminalBlock、ReadBlock、DiffBlock、SearchBlock、WebBlock、JsonTree |
| `dsh-ui-primitives/markdown` | MarkdownText、MessageText、CodeBlock、JsonBlock、`extractMarkdownPlainText` |
| `dsh-ui-primitives/icons` | 官方图标集、FishLogo、ReferenceIcon |
| `dsh-ui-primitives/theme` | 主题状态、DOM 应用函数和 React hooks |
| `dsh-ui-primitives/theme/bootstrap` | 无 React 依赖的首屏主题脚本 |
| `dsh-ui-primitives/tokens.css` | 五份官方主题 CSS 的有序聚合 |
| `dsh-ui-primitives/katex.css` | 精简为 woff2 的 KaTeX CSS 和字体资产 |

根入口不会再 re-export blocks、Markdown、icons 或 theme。这样只使用基础控件的应用不会触达 KaTeX、Shiki、mdast 或 micromark。

## 主题

主题偏好为 `light | dark | system`，持久化键是 `dsh-ui-primitives.theme-preference`。`initializeTheme()` 会恢复合法值，非法或缺失值回退到 `system`；localStorage 不可用时仍会安全应用主题。

```tsx
import {
  initializeTheme,
  setThemePreference,
  useIsDark,
  useThemePreference,
} from 'dsh-ui-primitives/theme'
```

主题通过 `document.documentElement.style.colorScheme` 与 `body[data-ds-dark-theme]` 应用。系统颜色变化只注册一个监听器，并仅在 `system` 模式下更新 DOM 与订阅者。

Next.js App Router 可在根布局的 `<body>` 内容前执行无 React bootstrap，避免已保存深色主题首次加载闪烁：

```tsx
import { THEME_BOOTSTRAP_SCRIPT } from 'dsh-ui-primitives/theme/bootstrap'
import 'dsh-ui-primitives/tokens.css'
import 'dsh-ui-primitives/katex.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        {children}
      </body>
    </html>
  )
}
```

## 组件 API

alpha.3 新增了 `ConnectionIndicator`、`ReferenceIcon`、`useAnchoredPosition`、`useDismissOnOutsidePointer`、增量 Markdown/viewport highlighting、`relativeTime` 与 user-text projection。Terminal、Read、Diff、Search、Web、JsonTree、Markdown、CodeBlock、JsonBlock 和 HoverCard 的界面文案由调用方通过必填 labels 传入，使库保持 Cordis 与 locale runtime 无关。

完整类型由各子路径的声明文件提供；demo 展示了中文 labels 的实际写法。

## 从 0.1.x 迁移

`0.2.0` 是 breaking release：

1. 将 blocks 导入改为 `dsh-ui-primitives/blocks`。
2. 将 Markdown 导入改为 `dsh-ui-primitives/markdown`。
3. 将图标导入改为 `dsh-ui-primitives/icons`。
4. 将主题 API 导入改为 `dsh-ui-primitives/theme`，并在客户端启动时调用 `initializeTheme()` 或使用 bootstrap。
5. 为 alpha.3 要求的组件补齐 `labels`、`copyLabel`、`copiedLabel` 或 `truncatedLabel`。
6. 使用数学渲染时在全局样式入口显式导入 `dsh-ui-primitives/katex.css`。
7. 删除对旧 `ConnectionBanner` 的引用，改用 `ConnectionIndicator`。

## 设计 Token

`tokens.css` 按官方级联顺序聚合：`base.css`、`design-platform.css`、`gradient-shadow-text.css`、`scrollbar.css`、`shiki.css`。它包含静态色板、语义 aliases、产品专属 tokens、阴影、字体、Markdown 排版和 Shiki 调色板。明暗切换仍由 `body[data-ds-dark-theme]` 驱动。

## 构建与验证

```sh
npm run typecheck
npm run test:unit
npm run build
npm run test:package
npm run test:react18
npm run test:next16
npm run demo:build
npm run build:site
```

构建每次先清理包自身的 `dist`，输出多入口 ESM、共享 chunks、独立声明文件、`meta.json` 和 `root-inputs.json`。package-content 测试会执行真实 `npm pack` 并验证全部 exports、声明、CSS 与 KaTeX 字体 URL；消费 fixtures 会安装该 tarball。

上游同步版本、commit、路径和本地适配见 [UPSTREAM.md](./UPSTREAM.md)。

## License

MIT。版权与第三方归属见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
