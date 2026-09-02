import { StrictMode, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import 'dsh-ui-primitives/tokens.css'
import 'dsh-ui-primitives/katex.css'
import {
  Button, Pill, Input, Menu, Tooltip, HoverCard, Toast, Modal,
  StateDot, DisclosureRow, BrandWordmark, ConnectionIndicator,
  RiskConfirmation, OnboardingSurface, projectUserText,
  relativeTime, useAnchoredMaxHeight, useAnchoredPosition,
  useDismissOnOutsidePointer, writeClipboard,
} from 'dsh-ui-primitives'
import {
  JsonTree, TerminalBlock, DiffBlock, ReadBlock, SearchBlock, WebBlock,
  DEFAULT_TERMINAL_MAX_LINES, DEFAULT_READ_MAX_LINES, DEFAULT_DIFF_MAX_LINES,
  DEFAULT_SEARCH_MAX_LINES, diffTotals,
} from 'dsh-ui-primitives/blocks'
import type {
  JsonTreeLabels, TerminalBlockLabels, DiffBlockLabels, ReadBlockLabels,
  SearchBlockLabels, WebBlockLabels,
} from 'dsh-ui-primitives/blocks'
import { CodeBlock, JsonBlock, MarkdownText, MessageText, extractMarkdownPlainText } from 'dsh-ui-primitives/markdown'
import type { MarkdownLabels } from 'dsh-ui-primitives/markdown'
import * as Icons from 'dsh-ui-primitives/icons'
import { FishLogo, ReferenceIcon, FISH_LOGO_PATH, FISH_LOGO_VIEWBOX,
  IconNewChatOutline16, IconSearchOutline16, IconSettingsOutline16, IconGlobeOutline14,
  IconPlusOutline16, IconCheckOutline16, IconCopyOutline16, IconRefreshOutline16,
  IconEditOutline16, IconTrashOutline16, IconWarningOutline16, IconSendOutline16,
  IconFolderOpenOutline16, IconCodeOutline16, IconDataOutline16, IconSparkle16,
  IconThinkOutline16, IconLightOutline16, IconDarkOutline16, IconFollowsystemOutline16,
  IconGoalOutline16, IconSkillOutline16, IconArchiveOutline20, IconChevronDownOutline14,
} from 'dsh-ui-primitives/icons'
import {
  DEFAULT_PREFERENCE, THEME_PREFERENCES, THEME_STORAGE_KEY,
  applyTheme, getIsDark, getThemePreference, initializeTheme, isThemePreference,
  resolveDark, setThemePreference, useIsDark, useThemePreference,
} from 'dsh-ui-primitives/theme'
import { THEME_BOOTSTRAP_SCRIPT } from 'dsh-ui-primitives/theme/bootstrap'
import './demo.css'

initializeTheme()

const markdownLabels = {
  code: { copyLabel: '复制', copiedLabel: '已复制' },
  footnotes: '脚注',
} satisfies MarkdownLabels

const foldLabels = {
  copy: '复制',
  copied: '已复制',
  collapseAria: '收起内容',
  expandAria: (hidden: number) => `展开 ${hidden} 行`,
  collapse: '收起',
  expand: (hidden: number) => `展开 ${hidden} 行`,
}

const terminalLabels = {
  ...foldLabels,
  signal: (signal: string) => `信号 ${signal}`,
  exitCode: (exitCode: number) => `退出码 ${exitCode}`,
  running: '运行中',
  failed: '失败',
  done: '完成',
  noOutput: '无输出',
} satisfies TerminalBlockLabels

const readLabels = {
  ...foldLabels,
  window: (shown: number, total: number) => `显示 ${shown} / 共 ${total} 行`,
} satisfies ReadBlockLabels

const diffLabels = {
  ...foldLabels,
  files: (count: number) => `${count} 个文件`,
} satisfies DiffBlockLabels

const searchLabels = {
  ...foldLabels,
  pathsSummary: (shown: number, total: number, truncated: boolean) =>
    `${truncated ? `显示 ${shown} / ` : ''}共 ${total} 个路径`,
  matchesSummary: (shown: number, total: number, files: number, truncated: boolean) =>
    `${truncated ? `显示 ${shown} / ` : ''}共 ${total} 处匹配，${files} 个文件`,
  noResults: '无结果',
} satisfies SearchBlockLabels

const webLabels = {
  noResults: '无结果',
  sourcesTruncated: '来源已截断',
  http: 'HTTP',
  contentTruncated: '内容已截断',
  markdown: markdownLabels,
} satisfies WebBlockLabels

const jsonTreeLabels = {
  copyValue: '复制值',
  copyJson: '复制 JSON',
  copyPath: '复制路径',
  copyPrettyJson: '复制格式化 JSON',
  copyCompactJson: '复制紧凑 JSON',
  copied: '已复制',
  copyFailed: '复制失败',
  collapseNode: '收起节点',
  expandNode: '展开节点',
  copyButtonTitle: (action: string) => action,
} satisfies JsonTreeLabels

const markdownSample = [
  '# 你好，DSH',
  '',
  '这是一个 **markdown** 渲染示例，支持 GFM 表格、\`inline code\`、引用与数学公式：',
  '',
  '\`\`\`ts',
  'const greeting = (name: string) => \`你好, \${name}!\`',
  "console.log(greeting('dsh-ui-primitives'))",
  '\`\`\`',
  '',
  '> 引用块：一切皆插件。',
  '',
  '| 组件 | 状态 |',
  '| --- | --- |',
  '| Button | ✅ |',
  '| Modal | ✅ |',
  '',
  '行内数学 $\\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}$ 与块级数学：',
  '',
  '$$E = mc^2$$',
  '',
  '[链接](https://deepseek.com) 与 ~~删除线~~ 与列表：',
  '- 一',
  '- 二',
  '',
].join('\n')

const exportGroups = [
  {
    path: 'dsh-ui-primitives',
    runtime: ['StateDot', 'DisclosureRow', 'Button', 'Pill', 'Input', 'Menu', 'useAnchoredMaxHeight', 'useAnchoredPosition', 'useDismissOnOutsidePointer', 'HoverCard', 'Modal', 'OnboardingSurface', 'RiskConfirmation', 'ConnectionIndicator', 'BrandWordmark', 'projectUserText', 'Tooltip', 'Toast', 'writeClipboard', 'relativeTime'],
    types: ['StateDotState', 'DisclosureRowProps', 'ButtonVariant', 'MenuEntry', 'MenuItem', 'MenuSeparator', 'MenuLabel', 'AnchoredPositionOptions', 'RiskConfirmationProps', 'ConnectionIndicatorState', 'BrandWordmarkProps', 'TooltipSide', 'RelativeTime', 'RelativeTimeUnit'],
  },
  {
    path: 'dsh-ui-primitives/blocks',
    runtime: ['JsonTree', 'TerminalBlock', 'DEFAULT_TERMINAL_MAX_LINES', 'ReadBlock', 'DEFAULT_READ_MAX_LINES', 'DiffBlock', 'DEFAULT_DIFF_MAX_LINES', 'diffTotals', 'SearchBlock', 'DEFAULT_SEARCH_MAX_LINES', 'WebBlock'],
    types: ['JsonTreeProps', 'JsonTreeLabels', 'TerminalBlockProps', 'TerminalBlockLabels', 'ReadBlockProps', 'ReadBlockLine', 'ReadBlockLabels', 'DiffBlockProps', 'DiffHunk', 'DiffBlockLabels', 'SearchBlockProps', 'SearchMatchesBlockProps', 'SearchPathsBlockProps', 'SearchFileGroup', 'SearchBlockLineMatch', 'SearchBlockLabels', 'WebBlockProps', 'WebSearchBlockProps', 'WebFetchBlockProps', 'WebSourceView', 'WebBlockLabels'],
  },
  {
    path: 'dsh-ui-primitives/markdown',
    runtime: ['CodeBlock', 'JsonBlock', 'MarkdownText', 'MessageText', 'extractMarkdownPlainText'],
    types: ['CodeBlockProps', 'MarkdownCodeLabels', 'MarkdownFileMentions', 'MarkdownLabels', 'MarkdownPlainTextMode', 'MarkdownPlainTextOptions'],
  },
  {
    path: 'dsh-ui-primitives/icons',
    runtime: ['74 Icon* components', 'FishLogo', 'FISH_LOGO_PATH', 'FISH_LOGO_VIEWBOX', 'ReferenceIcon'],
    types: ['IconProps', 'ReferenceIconKind', 'ReferenceIconProps'],
  },
  {
    path: 'dsh-ui-primitives/theme',
    runtime: ['DEFAULT_PREFERENCE', 'THEME_PREFERENCES', 'THEME_STORAGE_KEY', 'applyTheme', 'getIsDark', 'getThemePreference', 'initializeTheme', 'isThemePreference', 'resolveDark', 'setThemePreference', 'useThemePreference', 'useIsDark'],
    types: ['ThemePreference'],
  },
  {
    path: 'dsh-ui-primitives/theme/bootstrap',
    runtime: ['DEFAULT_PREFERENCE', 'THEME_STORAGE_KEY', 'THEME_BOOTSTRAP_SCRIPT'],
    types: [],
  },
  {
    path: 'Stylesheet exports',
    runtime: ['dsh-ui-primitives/tokens.css', 'dsh-ui-primitives/katex.css'],
    types: [],
  },
]

function App() {
  const dark = useIsDark()
  const [toast, setToast] = useState<{ text: string; seq: number } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [disclosureOpen, setDisclosureOpen] = useState(true)
  const [riskOpen, setRiskOpen] = useState(false)
  const [riskAcknowledged, setRiskAcknowledged] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [connection, setConnection] = useState<'disconnected' | 'connecting' | 'recovered'>('disconnected')
  const [iconQuery, setIconQuery] = useState('')

  const iconEntries = Object.entries(Icons)
    .filter(([name, value]) => name.startsWith('Icon') && typeof value === 'function')
    .filter(([name]) => name.toLowerCase().includes(iconQuery.trim().toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b)) as [string, ComponentType<{ size?: number }>][]

  const reconnect = () => {
    setConnection('connecting')
    window.setTimeout(() => setConnection('recovered'), 1200)
  }

  return (
    <div className="demo-shell">
      <nav className="demo-nav" aria-label="组件目录">
        <a href="#foundations">基础</a>
        <a href="#primitives">Primitives</a>
        <a href="#overlays">浮层</a>
        <a href="#surfaces">产品界面</a>
        <a href="#exports">Hooks 与 API</a>
        <a href="#blocks">Blocks</a>
        <a href="#markdown">Markdown</a>
        <a href="#icons">Icons</a>
      </nav>
      <div className="page">
      <header className="masthead">
        <div className="brand"><FishLogo /><BrandWordmark /></div>
        <div className="theme-switch">
          <Pill active={!dark} onClick={() => setThemePreference('light')}><IconLightOutline16 /> 浅色</Pill>
          <Pill active={dark} onClick={() => setThemePreference('dark')}><IconDarkOutline16 /> 深色</Pill>
          <Pill active={false} onClick={() => setThemePreference('system')}><IconFollowsystemOutline16 /> 跟随系统</Pill>
        </div>
      </header>

      <section id="foundations" className="section-block">
        <div className="section-heading"><span>01</span><div><h2>基础与主题</h2><p>品牌、主题与语义状态</p></div></div>
        <div className="specimen-grid foundations-grid">
          <div className="specimen"><h3>BrandWordmark / FishLogo</h3><div className="row"><FishLogo /><BrandWordmark size={22} /></div></div>
          <div className="specimen"><h3>ConnectionIndicator</h3><div className="row"><ConnectionIndicator state={connection} disconnectedLabel="连接已中断" reconnectLabel="立即重连" connectingLabel="正在连接" recoveredLabel="连接已恢复" reconnectActionLabel="重新连接" restartActionLabel="重新开始连接" onReconnect={reconnect} /><Button size="sm" variant="outline" onClick={() => setConnection('disconnected')}>重置</Button></div></div>
        </div>
      </section>

      <section id="primitives" className="section-block">
        <div className="section-heading"><span>02</span><div><h2>Primitives</h2><p>高频输入、操作与状态组件</p></div></div>
      </section>

      <section>
        <h2>按钮 Button</h2>
        <div className="row">
          <Button variant="primary">主要</Button>
          <Button variant="ghost">幽灵</Button>
          <Button variant="outline">描边</Button>
          <Button variant="toolbar"><IconSettingsOutline16 /> 工具栏</Button>
          <Button variant="primary" size="sm">小号</Button>
          <Button variant="ghost" size="sm" icon={<IconPlusOutline16 />}>新建</Button>
          <Button disabled>禁用</Button>
        </div>
      </section>

      <section>
        <h2>胶囊 Pill / 输入 Input</h2>
        <div className="row">
          <Pill active>已选中</Pill>
          <Pill>未选中</Pill>
          <Pill onClick={() => {}}>可点击</Pill>
          <Input placeholder="搜索会话…" icon={<IconSearchOutline16 />} style={{ width: 280 }} />
        </div>
      </section>

      <section>
        <h2>状态点 StateDot / 折叠行 DisclosureRow</h2>
        <div className="row">
          <StateDot state="done" /> 完成
          <StateDot state="warning" /> 注意
          <StateDot state="ongoing" /> 进行中
          <StateDot state="error" /> 错误
        </div>
        <DisclosureRow
          icon={<IconFolderOpenOutline16 />}
          title="tool.call.bash · 运行 pnpm test"
          open={disclosureOpen}
          expandable
          onToggle={() => setDisclosureOpen((o) => !o)}
        >
          <p style={{ margin: 0, padding: '8px 0' }}>展开内容区。</p>
        </DisclosureRow>
      </section>

      <section id="overlays" className="section-block">
        <div className="section-heading"><span>03</span><div><h2>浮层与确认</h2><p>Menu、Tooltip、HoverCard、Toast、Modal 与风险确认</p></div></div>
        <h3>Menu / Tooltip / HoverCard / Toast / Modal</h3>
        <div className="row">
          <Menu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            anchor={<Button onClick={() => setMenuOpen((o) => !o)} icon={<IconChevronDownOutline14 />}>操作菜单</Button>}
            items={[
              { type: 'label', id: 'actions', text: '常用操作' },
              { id: 'rename', label: '重命名', icon: <IconEditOutline16 /> },
              { id: 'copy', label: '复制链接', icon: <IconCopyOutline16 /> },
              { id: 'disabled', label: '不可用操作', disabled: true },
              { id: 'export', label: '导出', submenu: [
                { id: 'export-json', label: 'JSON' },
                { id: 'export-markdown', label: 'Markdown' },
              ] },
              { type: 'separator', id: 'sep-danger' },
              { type: 'label', id: 'g', text: '危险区' },
              { id: 'delete', label: '删除', icon: <IconTrashOutline16 />, danger: true },
            ]}
            onSelect={(id) => { setMenuOpen(false); setToast({ text: '选中: ' + id, seq: Date.now() }) }}
          />
          <Tooltip label="悬停提示 (Tooltip)" side="bottom">
            <Button variant="ghost">悬停我</Button>
          </Tooltip>
          <Tooltip label="右侧提示" side="right"><Button variant="ghost">右侧</Button></Tooltip>
          <Tooltip label="顶部提示" side="top"><Button variant="ghost">顶部</Button></Tooltip>
          <HoverCard
            anchor={<Button variant="ghost">悬停看卡片</Button>}
            content={<div style={{ padding: 8 }}>HoverCard 内容，可选中复制。这里展示的是 portaled 预览卡片。</div>}
            copyText="dsh-ui-primitives 示例文本"
            copyLabel="复制"
            copiedLabel="已复制"
          />
          <Button variant="ghost" onClick={() => setToast({ text: '已复制到剪贴板', seq: Date.now() })}>显示 Toast</Button>
          <Button variant="primary" onClick={() => setModalOpen(true)}>打开 Modal</Button>
          <Button variant="outline" onClick={() => { setRiskAcknowledged(false); setRiskOpen(true) }}>风险确认</Button>
        </div>
        {toast && <Toast key={toast.seq} text={toast.text} onDone={() => setToast(null)} />}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="新建会话"
          closeLabel="关闭"
          description="创建一个新的工作会话。"
          footer={
            <>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>创建</Button>
            </>
          }
        >
          <Input placeholder="会话名称" autoFocus />
        </Modal>
        <RiskConfirmation
          open={riskOpen}
          title="删除远程会话"
          description="该操作会永久移除远程会话及其未同步的运行记录。"
          acknowledgeLabel="我已了解此操作不可撤销"
          cancelLabel="取消"
          closeLabel="关闭"
          confirmLabel="确认删除"
          acknowledged={riskAcknowledged}
          onAcknowledgedChange={setRiskAcknowledged}
          onCancel={() => setRiskOpen(false)}
          onConfirm={() => { setRiskOpen(false); setToast({ text: '风险操作已确认', seq: Date.now() }) }}
        />
      </section>

      <section id="surfaces" className="section-block">
        <div className="section-heading"><span>04</span><div><h2>产品界面</h2><p>OnboardingSurface、引用与用户文本投影</p></div></div>
        <div className="specimen-grid">
          <div className="specimen"><h3>OnboardingSurface</h3><Button variant="primary" onClick={() => setOnboardingOpen(true)}>打开引导页</Button></div>
          <div className="specimen"><h3>ReferenceIcon</h3><div className="reference-row"><span><ReferenceIcon kind="session" /> session</span><span><ReferenceIcon kind="file" /> file</span><span><ReferenceIcon kind="folder" /> folder</span></div></div>
          <div className="specimen wide"><h3>projectUserText</h3><div className="user-text-example">{projectUserText('请使用 /review 检查 @src/components/ 并参考 @[支付重构](dsh-session:session-42)', ['支付重构'])}</div></div>
        </div>
      </section>

      {onboardingOpen && (
        <OnboardingSurface>
          <div className="onboarding-demo">
            <FishLogo size={40} />
            <span className="eyebrow">WELCOME TO DSH</span>
            <h2>准备好开始新的工作会话</h2>
            <p>选择工作区后，你可以连接代码仓库并加载所需技能。</p>
            <div className="row"><Button variant="outline" onClick={() => setOnboardingOpen(false)}>稍后</Button><Button variant="primary" onClick={() => setOnboardingOpen(false)}>继续</Button></div>
          </div>
        </OnboardingSurface>
      )}

      <section id="exports" className="section-block">
        <div className="section-heading"><span>05</span><div><h2>Hooks、工具与完整导出</h2><p>可交互运行示例、返回值和类型入口</p></div></div>
        <HookLab />
        <UtilityLab />
        <ThemeLab />
        <ExportInventory />
      </section>

      <section id="blocks" className="section-block">
        <div className="section-heading"><span>06</span><div><h2>Blocks</h2><p>六类工具结果与结构化数据展示</p></div></div>
      </section>

      <section>
        <h2>JSON 树 JsonTree</h2>
        <JsonTree
          label="JSON 数据"
          data={{ name: 'dsh-ui-primitives', version: '0.2.0', license: 'MIT', tags: ['react', 'tokens'], deps: { react: '^18 || ^19', shiki: '^4' }, optional: null, ok: true }}
          labels={jsonTreeLabels}
        />
      </section>

      <section>
        <h2>终端 TerminalBlock</h2>
        <TerminalBlock labels={terminalLabels} command="pnpm test -- --runInBand" cwd="~/AIGC/dsh-ui-primitives" output="✓ 42 tests passed (1.2s)\n\x1b[32m  all good\x1b[0m" exitCode={0} />
        <TerminalBlock labels={terminalLabels} command="npm run lint" cwd="/tmp/broken" output="Error: ENOENT: no such file or directory" exitCode={2} />
        <TerminalBlock labels={terminalLabels} command="pnpm dev" cwd="~" running />
      </section>

      <section>
        <h2>读写 DiffBlock / ReadBlock / SearchBlock / WebBlock</h2>
        <DiffBlock
          labels={diffLabels}
          diffs={[
            { path: 'src/theme.ts', oldText: 'export const DEFAULT_PREFERENCE = "system"', newText: 'export const DEFAULT_PREFERENCE: ThemePreference = "system"' },
            { path: 'README.md', oldText: null, newText: '# dsh-ui-primitives' },
          ]}
        />
        <ReadBlock
          labels={readLabels}
          label="src/index.ts"
          lines={[
            { number: 1, text: "export { StateDot } from './StateDot'" },
            { number: 2, text: "export { Button } from './Button'" },
            { number: 3, text: "export { Pill } from './Pill'" },
          ]}
          totalLines={120}
        />
        <SearchBlock
          labels={searchLabels}
          kind="matches"
          truncated
          total={42}
          files={[
            { path: 'src/theme.ts', matches: [{ lineNumber: 12, line: 'export function resolveDark' }, { lineNumber: 20, line: 'document.body.toggleAttribute' }] },
            { path: 'src/index.ts', matches: [{ lineNumber: 3, line: 'export { Pill' }] },
          ]}
        />
        <WebBlock
          labels={webLabels}
          kind="search"
          answer="DeepSeek Harness 是基于 Cordis 的插件化 Agent 运行时。"
          truncated={false}
          sources={[
            { url: 'https://github.com/deepseek-ai/deepseek-harness', title: 'deepseek-harness', snippet: 'Everything is a Plugin.', publishedAt: '2026-08' },
            { url: 'https://deepseek.com/harness', title: 'DeepSeek Harness', snippet: '官方站点', publishedAt: '2026-08' },
          ]}
        />
        <WebBlock labels={webLabels} kind="fetch" url="https://deepseek.com/harness" statusCode={200} truncated={false} />
      </section>

      <section id="markdown" className="section-block">
        <div className="section-heading"><span>07</span><div><h2>Markdown</h2><p>MarkdownText、MessageText、CodeBlock 与 JsonBlock</p></div></div>
      </section>

      <section>
        <h2>代码块 CodeBlock / JsonBlock</h2>
        <CodeBlock code={'const x: number = 42\nexport default x'} lang="ts" copyLabel="复制" copiedLabel="已复制" />
        <JsonBlock label="response" payload={{ ok: true, data: { id: 1, items: [1, 2, 3] } }} truncatedLabel={(total) => `已截断，共 ${total} 字符`} defaultOpen />
      </section>

      <section>
        <h2>MarkdownText / MessageText</h2>
        <MarkdownText text={markdownSample} labels={markdownLabels} />
        <h3>MessageText（字面文本）</h3>
        <MessageText text="这是 **不会** 被渲染成 Markdown 的字面文本。" />
      </section>

      <section id="icons" className="section-block">
        <div className="section-heading"><span>08</span><div><h2>Icons</h2><p>{iconEntries.length} / 74 个 Icon* 导出</p></div></div>
        <Input className="icon-search" value={iconQuery} onChange={(event) => setIconQuery(event.target.value)} placeholder="搜索图标名称" icon={<IconSearchOutline16 />} />
        <div className="icons">
          {iconEntries.map(([name, Icon]) => (
            <button key={name} type="button" className="icon-cell" title={`复制 ${name}`} onClick={() => { void navigator.clipboard?.writeText(name); setToast({ text: `已复制 ${name}`, seq: Date.now() }) }}>
              <Icon size={20} /><span>{name.replace(/^Icon/, '')}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="foot">dsh-ui-primitives · 与 DeepSeek Harness Web UI 设计系统严格一致（--dsw-* tokens，MIT）</footer>
      </div>
    </div>
  )
}

function HookLab() {
  const anchoredRoot = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const maxHeightRef = useRef<HTMLDivElement>(null)
  const [positionOpen, setPositionOpen] = useState(false)
  const [maxOpen, setMaxOpen] = useState(false)
  const position = useAnchoredPosition({ open: positionOpen, anchorRef, panelRef, side: 'bottom', gap: 6, margin: 12 })
  const maxHeight = useAnchoredMaxHeight(maxHeightRef, 180, maxOpen)
  useDismissOnOutsidePointer(anchoredRoot, positionOpen, setPositionOpen)

  return (
    <div className="api-lab">
      <h3>定位与关闭 Hooks</h3>
      <div className="hook-grid">
        <div className="hook-card" ref={anchoredRoot}>
          <code>useAnchoredPosition</code>
          <p>固定浮层跟随触发器，并限制在视口边缘内。</p>
          <span ref={anchorRef}><Button size="sm" variant="outline" onClick={() => setPositionOpen((open) => !open)}>切换浮层</Button></span>
          <output>{position ? `left ${Math.round(Number(position.left))} / top ${Math.round(Number(position.top))}` : 'closed'}</output>
          {positionOpen && <div ref={panelRef} className="hook-popover" style={position ?? { visibility: 'hidden' }}>滚动或缩放窗口时持续定位</div>}
        </div>
        <div className="hook-card">
          <code>useDismissOnOutsidePointer</code>
          <p>上一个浮层在点击其容器外部时关闭。</p>
          <output>{positionOpen ? 'listener attached' : 'listener detached'}</output>
        </div>
        <div className="hook-card max-height-card">
          <code>useAnchoredMaxHeight</code>
          <p>自底向上生长的面板按视口空间收紧最大高度。</p>
          <Button size="sm" variant="outline" onClick={() => setMaxOpen((open) => !open)}>切换面板</Button>
          <output>max-height: {maxHeight}px</output>
          {maxOpen && <div className="max-height-stage"><div ref={maxHeightRef} className="max-height-panel" style={{ maxHeight }}>viewport-fit panel</div></div>}
        </div>
      </div>
    </div>
  )
}

function UtilityLab() {
  const [clipboardResult, setClipboardResult] = useState('尚未写入')
  const now = Date.now()
  const relativeSamples = [30_000, 5 * 60_000, 3 * 3_600_000, 2 * 86_400_000, 70 * 86_400_000]
  const diffSample = diffTotals([{ path: 'src/demo.tsx', oldText: 'old\nline', newText: 'new\nline\nadded' }])
  const plainText = extractMarkdownPlainText('## Release **0.2.0**\n\n[Read the guide](https://example.com)', { mode: 'first-paragraph' })
  return (
    <div className="api-lab">
      <h3>工具函数与常量</h3>
      <div className="utility-grid">
        <div className="hook-card">
          <code>writeClipboard</code>
          <p>通过异步 Clipboard API 写入，返回宿主是否接受。</p>
          <Button size="sm" variant="outline" onClick={async () => setClipboardResult(await writeClipboard('dsh-ui-primitives') ? 'true · 已写入' : 'false · 宿主拒绝')}>写入示例</Button>
          <output>{clipboardResult}</output>
        </div>
        <div className="hook-card">
          <code>relativeTime</code>
          <div className="result-list">{relativeSamples.map((offset) => { const result = relativeTime(now - offset, now); return <span key={offset}>{offset / 60_000} min → {result.n} {result.unit}</span> })}</div>
        </div>
        <div className="hook-card">
          <code>extractMarkdownPlainText</code>
          <pre>{plainText}</pre>
        </div>
        <div className="hook-card">
          <code>diffTotals</code>
          <output>+{diffSample.added} / -{diffSample.removed}</output>
        </div>
        <div className="hook-card wide">
          <code>Block limits</code>
          <div className="constant-row"><span>terminal {DEFAULT_TERMINAL_MAX_LINES}</span><span>read {DEFAULT_READ_MAX_LINES}</span><span>diff {DEFAULT_DIFF_MAX_LINES}</span><span>search {DEFAULT_SEARCH_MAX_LINES}</span></div>
        </div>
        <div className="hook-card wide">
          <code>FishLogo constants</code>
          <div className="constant-row"><span>FISH_LOGO_VIEWBOX = {JSON.stringify(FISH_LOGO_VIEWBOX)}</span><span>FISH_LOGO_PATH = {FISH_LOGO_PATH.length} chars</span></div>
        </div>
      </div>
    </div>
  )
}

function ThemeLab() {
  const preference = useThemePreference()
  const dark = useIsDark()
  const [probe, setProbe] = useState('system')
  return (
    <div className="api-lab">
      <h3>主题 API 与无 React bootstrap</h3>
      <div className="theme-api-grid">
        <div className="hook-card">
          <code>useThemePreference / useIsDark</code>
          <div className="theme-readout"><strong>{preference}</strong><span>{dark ? 'dark DOM' : 'light DOM'}</span></div>
          <div className="row">{THEME_PREFERENCES.map((item) => <Pill key={item} active={preference === item} onClick={() => setThemePreference(item)}>{item}</Pill>)}</div>
        </div>
        <div className="hook-card">
          <code>get / resolve / validate</code>
          <Input value={probe} onChange={(event) => setProbe(event.target.value)} aria-label="主题值校验" />
          <div className="result-list"><span>isThemePreference → {String(isThemePreference(probe))}</span><span>getThemePreference → {getThemePreference()}</span><span>getIsDark → {String(getIsDark())}</span><span>resolveDark(current) → {String(resolveDark(preference))}</span></div>
        </div>
        <div className="hook-card wide">
          <code>constants / applyTheme / initializeTheme</code>
          <div className="constant-row"><span>DEFAULT_PREFERENCE = {DEFAULT_PREFERENCE}</span><span>THEME_STORAGE_KEY = {THEME_STORAGE_KEY}</span><span>applyTheme({preference})</span><span>initializeTheme() → {initializeTheme()}</span></div>
          <Button size="sm" variant="outline" onClick={() => applyTheme(preference)}>重新应用当前主题</Button>
        </div>
        <div className="hook-card wide">
          <code>THEME_BOOTSTRAP_SCRIPT</code>
          <pre>{THEME_BOOTSTRAP_SCRIPT}</pre>
        </div>
      </div>
    </div>
  )
}

function ExportInventory() {
  return (
    <div className="api-lab export-inventory">
      <h3>按入口分组的完整导出清单</h3>
      {exportGroups.map((group) => (
        <details key={group.path} open={group.path === 'dsh-ui-primitives'}>
          <summary><code>{group.path}</code><span>{group.runtime.length} runtime · {group.types.length} type-only</span></summary>
          <div className="export-columns">
            <div><strong>Runtime</strong><div className="export-tags">{group.runtime.map((item) => <span key={item}>{item}</span>)}</div></div>
            <div><strong>Type-only</strong><div className="export-tags type-tags">{group.types.length > 0 ? group.types.map((item) => <span key={item}>{item}</span>) : <span>none</span>}</div></div>
          </div>
        </details>
      ))}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
