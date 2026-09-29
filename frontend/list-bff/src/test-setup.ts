import { beforeEach } from '@jest/globals'

// The URL is global state: reset it so tests don't leak into each other.
beforeEach(() => history.replaceState(null, '', '/'))
