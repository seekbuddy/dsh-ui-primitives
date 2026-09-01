'use client'

import { Button } from 'dsh-ui-primitives'
import { TerminalBlock } from 'dsh-ui-primitives/blocks'
import { MarkdownText } from 'dsh-ui-primitives/markdown'
import { IconCheckOutline16 } from 'dsh-ui-primitives/icons'
import { setThemePreference, useIsDark } from 'dsh-ui-primitives/theme'

const markdownLabels = {
  code: { copyLabel: 'Copy', copiedLabel: 'Copied' },
  footnotes: 'Footnotes',
}

const terminalLabels = {
  signal: (signal: string) => `Signal ${signal}`,
  exitCode: (code: number) => `Exit ${code}`,
  running: 'Running',
  failed: 'Failed',
  done: 'Done',
  copy: 'Copy',
  copied: 'Copied',
  noOutput: 'No output',
  collapseAria: 'Collapse output',
  collapse: 'Collapse',
  expandAria: (hidden: number) => `Expand ${hidden} lines`,
  expand: (hidden: number) => `Expand ${hidden} lines`,
}

export function Consumer() {
  const dark = useIsDark()
  return (
    <main>
      <Button variant="primary" onClick={() => setThemePreference(dark ? 'light' : 'dark')}>
        <IconCheckOutline16 /> Toggle theme
      </Button>
      <TerminalBlock labels={terminalLabels} command="npm test" output="passed" exitCode={0} />
      <MarkdownText labels={markdownLabels} text={'Math: $x^2$'} />
    </main>
  )
}
