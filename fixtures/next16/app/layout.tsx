import type { ReactNode } from 'react'
import { THEME_BOOTSTRAP_SCRIPT } from 'dsh-ui-kit/theme/bootstrap'
import 'dsh-ui-kit/tokens.css'
import 'dsh-ui-kit/katex.css'

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
