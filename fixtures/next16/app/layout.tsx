import type { ReactNode } from 'react'
import { THEME_BOOTSTRAP_SCRIPT } from 'dsh-ui-primitives/theme/bootstrap'
import 'dsh-ui-primitives/tokens.css'
import 'dsh-ui-primitives/katex.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        {children}
      </body>
    </html>
  )
}
