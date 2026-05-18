export const RESOLUTION_TIERS = {
  original: { label: 'Original',    color: '#38a169', bg: '#E1F5EE' },
  small:    { label: 'Small (480p)', color: '#0C447C', bg: '#E6F1FB' },
  medium:   { label: 'Medium (720p)',color: '#633806', bg: '#FAEEDA' },
  large:    { label: 'Large (1080p)',color: '#712B13', bg: '#FAECE7' },
}

export const STATUS = {
  PROCESSING: 'processing',
  DONE:       'done',
  ERROR:      'error',
}

export const FEED_LIMIT    = 10
export const EXPLORE_LIMIT = 12
export const POLL_INTERVAL = 2000   // ms
