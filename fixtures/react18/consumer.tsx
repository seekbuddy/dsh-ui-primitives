import { Button, ConnectionIndicator } from 'dsh-ui-primitives'
import type { ThemePreference } from 'dsh-ui-primitives/theme'

const preference: ThemePreference = 'system'

export const view = (
  <div data-theme={preference}>
    <Button variant="primary">React 18</Button>
    <ConnectionIndicator
      state="recovered"
      disconnectedLabel="Disconnected"
      reconnectLabel="Reconnect"
      connectingLabel="Connecting"
      recoveredLabel="Connected"
      reconnectActionLabel="Reconnect now"
      restartActionLabel="Restart connection"
      onReconnect={() => {}}
    />
  </div>
)
