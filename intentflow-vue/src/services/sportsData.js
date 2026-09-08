// =============================================
// IntentFlow — Sports Data Service
// Parses CSV via PapaParse, caches in memory,
// exposes clean API — UI never touches CSV directly
// =============================================
import Papa from 'papaparse'

let _cache = null
let _loading = false
let _listeners = []

// Category types that use different labelling than sports
const NON_SPORT_CATEGORIES = ['Casino', 'Live Casino', 'Virtual', 'Lotto']

// Normalise a raw CSV row to the internal Event shape
function normalise(row) {
  const sport = row.sport || 'Football'
  const isNonSport = NON_SPORT_CATEGORIES.includes(sport)
  const home = row.home_team || 'Home Team'
  const away = row.away_team || 'Away Team'
  return {
    id: row.id || `evt-${Math.random().toString(36).slice(2)}`,
    sport,
    league: row.league || 'Unknown League',
    homeTeam: home,
    awayTeam: away,
    title: isNonSport ? `${home} — ${away}` : `${home} vs ${away}`,
    startTime: row.start_time || new Date().toISOString(),
    status: row.status || 'UPCOMING', // LIVE | UPCOMING
    homeOdds: parseFloat(row.home_odds) || 0,
    drawOdds: parseFloat(row.draw_odds) || 0,
    awayOdds: parseFloat(row.away_odds) || 0,
    venue: row.venue || '',
    country: row.country || '',
    isFeatured: row.is_featured === 'true',
    isLive: row.is_live === 'true',
    sessionFit: parseInt(row.session_fit) || 70,
    isNonSport,
  }
}

async function loadAll() {
  if (_cache) return _cache
  if (_loading) {
    return new Promise((res) => _listeners.push(res))
  }
  _loading = true
  return new Promise((resolve, reject) => {
    Papa.parse('/sports_data.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete(results) {
        _cache = results.data.map(normalise)
        _loading = false
        _listeners.forEach(fn => fn(_cache))
        _listeners = []
        resolve(_cache)
      },
      error(err) {
        _loading = false
        reject(err)
      },
    })
  })
}

// Public API

export async function getSports() {
  const all = await loadAll()
  const sports = [...new Set(all.map(e => e.sport))]
  return sports.map(s => ({
    id: s.toLowerCase().replace(/\s+/g, '-'),
    name: s,
    icon: sportIcon(s),
  }))
}

export async function getEvents({ sport, league, status, featured, search, limit = 50, offset = 0 } = {}) {
  const all = await loadAll()
  let filtered = all

  if (sport && sport !== 'all') {
    const cleanSport = sport.toLowerCase().replace(/[-_\s]+/g, '')
    filtered = filtered.filter(e => e.sport.toLowerCase().replace(/[-_\s]+/g, '') === cleanSport)
  }
  if (league) {
    filtered = filtered.filter(e => e.league.toLowerCase().includes(league.toLowerCase()))
  }
  if (status === 'live') {
    filtered = filtered.filter(e => e.isLive)
  } else if (status === 'upcoming') {
    filtered = filtered.filter(e => !e.isLive)
  }
  if (featured) {
    filtered = filtered.filter(e => e.isFeatured)
  }
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(e =>
      e.homeTeam.toLowerCase().includes(q) ||
      e.awayTeam.toLowerCase().includes(q) ||
      e.league.toLowerCase().includes(q) ||
      e.sport.toLowerCase().includes(q)
    )
  }

  return {
    total: filtered.length,
    data: filtered.slice(offset, offset + limit),
  }
}

export async function getEventById(id) {
  const all = await loadAll()
  return all.find(e => e.id === id) || null
}

export async function getLiveEvents() {
  const { data } = await getEvents({ status: 'live' })
  return data
}

export async function getRecommendedEvents() {
  const all = await loadAll()
  return all.filter(e => e.isFeatured).slice(0, 6)
}

export async function searchEvents(query) {
  const { data } = await getEvents({ search: query })
  return data
}

export async function filterEvents(filters) {
  return getEvents(filters)
}

// Helper
function sportIcon(sport) {
  const map = {
    Football: '⚽', Nogomet: '⚽',
    Basketball: '🏀', 'Košarka': '🏀',
    Tennis: '🎾', Tenis: '🎾',
    'Ice Hockey': '🏒', Hokej: '🏒', Hockey: '🏒',
    Volleyball: '🏐', Odbojka: '🏐',
    'Combat Sports': '🥊', 'Borilački sportovi': '🥊', MMA: '🥊',
    Baseball: '⚾',
    Cricket: '🏏', Golf: '⛳', Formula1: '🏎️', Rugby: '🏉',
    Casino: '🎰', 'Live Casino': '🃏', Virtual: '🎮', Lotto: '🎱',
  }
  return map[sport] || '🏆'
}
