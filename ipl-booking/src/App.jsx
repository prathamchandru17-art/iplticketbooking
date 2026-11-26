import { useEffect, useState } from 'react'
import Hero from './components/Hero.jsx'
import MatchCard from './components/MatchCard.jsx'
import Navbar from './components/Navbar.jsx'
import { supabase } from './supabase.js'
import './App.css'

function formatMatchDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function App() {
  const [matches, setMatches] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [ticketCategory, setTicketCategory] = useState('General')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) ?? null
  const configurationError = !supabase
    ? 'Supabase is not configured. Add your project URL and publishable key to ipl-booking/.env.local, then restart the app.'
    : ''

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isActive = true
    const fetchMatches = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('matches')
          .select('*')
          .order('match_date', { ascending: true })

        if (fetchError) throw fetchError
        if (isActive) {
          setMatches(data.map((match) => ({
            ...match,
            date: formatMatchDate(match.match_date),
            time: match.match_time,
          })))
          setError('')
          setIsLoading(false)
        }
      } catch (fetchError) {
        if (isActive) {
          setError(`Could not load matches: ${fetchError.message}`)
          setIsLoading(false)
        }
      }
    }

    fetchMatches()
    const channel = supabase
      .channel('matches-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        fetchMatches,
      )
      .subscribe((status) => {
        if (isActive && (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT')) {
          setError('Live match updates could not connect. Check your Supabase Realtime settings.')
        }
      })

    return () => {
      isActive = false
      supabase.removeChannel(channel)
    }
  }, [])

  const handleBooking = async (event) => {
    event.preventDefault()
    if (!supabase || !selectedMatch) return

    setIsBooking(true)
    setError('')
    setBookingMessage('')
    try {
      const { error: bookingError } = await supabase.rpc('create_booking', {
        p_match_id: selectedMatch.id,
        p_customer_name: customerName.trim(),
        p_customer_email: customerEmail.trim(),
        p_ticket_category: ticketCategory,
        p_quantity: quantity,
      })

      if (bookingError) throw bookingError
      setBookingMessage(`Booking confirmed for ${quantity} ${ticketCategory} ticket${quantity === 1 ? '' : 's'} to ${selectedMatch.teams}.`)
      setCustomerName('')
      setCustomerEmail('')
      setQuantity(1)
    } catch (bookingError) {
      setError(`Could not complete booking: ${bookingError.message}`)
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Hero />

        <section className="matches-section" id="matches" aria-labelledby="matches-heading">
          <div className="section-heading">
            <p className="eyebrow">IPL</p>
            <h2 id="matches-heading">Upcoming Matches</h2>
            <p>Choose a match to see your selection summary.</p>
          </div>

          {configurationError && <p className="status-message" role="alert">{configurationError}</p>}
          {error && <p className="status-message error-message" role="alert">{error}</p>}
          {isLoading && <p className="status-message" role="status">Loading matches...</p>}
          {!isLoading && !configurationError && !error && matches.length === 0 && (
            <p className="status-message">No upcoming matches are available.</p>
          )}
          {matches.length > 0 && (
            <div className="match-grid">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isSelected={selectedMatchId === match.id}
                  onSelect={(selected) => {
                    setSelectedMatchId(selected.id)
                    setTicketCategory(Object.keys(selected.prices)[0] ?? 'General')
                    setBookingMessage('')
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="selection-panel" id="selection" aria-live="polite" aria-atomic="true">
          <p className="eyebrow">Your selection</p>
          {selectedMatch ? (
            <>
              <h2>{selectedMatch.teams}</h2>
              <p>{selectedMatch.date} at {selectedMatch.time}</p>
              <p>{selectedMatch.venue}</p>
              <form className="booking-form" onSubmit={handleBooking}>
                <label>
                  Name
                  <input
                    autoComplete="name"
                    maxLength="120"
                    onChange={(event) => setCustomerName(event.target.value)}
                    required
                    value={customerName}
                  />
                </label>
                <label>
                  Email
                  <input
                    autoComplete="email"
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    required
                    type="email"
                    value={customerEmail}
                  />
                </label>
                <label>
                  Ticket type
                  <select
                    onChange={(event) => setTicketCategory(event.target.value)}
                    value={ticketCategory}
                  >
                    {Object.entries(selectedMatch.prices).map(([category, price]) => (
                      <option key={category} value={category}>
                        {category} — Rs. {Number(price).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Tickets
                  <input
                    min="1"
                    max={Math.min(10, selectedMatch.available_seats)}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                    required
                    type="number"
                    value={quantity}
                  />
                </label>
                <p className="booking-total">
                  Total: Rs. {(Number(selectedMatch.prices[ticketCategory]) * quantity).toLocaleString('en-IN')}
                </p>
                <button className="button button-gold" disabled={isBooking || selectedMatch.available_seats < 1} type="submit">
                  {isBooking ? 'Booking...' : 'Book tickets'}
                </button>
              </form>
            </>
          ) : (
            <p>Select a match to see its details here.</p>
          )}
          {bookingMessage && <p className="success-message" role="status">{bookingMessage}</p>}
        </section>
      </main>

      <footer className="site-footer">
        <p>&copy; 2026 IPL Ticket Booking</p>
      </footer>
    </div>
  )
}

export default App
