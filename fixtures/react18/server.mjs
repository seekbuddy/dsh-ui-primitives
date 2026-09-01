import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { Button } from 'dsh-ui-kit'

const html = renderToString(createElement(Button, { variant: 'primary' }, 'React 18'))
if (!html.includes('React 18')) throw new Error('server render did not produce Button content')
console.log('[react18] server rendering passed')
