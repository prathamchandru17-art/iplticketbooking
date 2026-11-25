import { useState } from 'react'
import Hero from './components/Hero.jsx'
import MatchCard from './components/MatchCard.jsx'
import Navbar from './components/Navbar.jsx'
import './App.css'

const matches = [
  {
    id: 'match-01',
    teams: 'RCB vs MI',
    date: 'April 5, 2026',
    time: '7:30 PM',
    venue: 'Wankhede Stadium, Mumbai',
    prices: { General: 1500, Premium: 3500, VIP: 7500 },
  },
  {
    id: 'match-02',
    teams: 'CSK vs KKR',
    date: 'April 6, 2026',
    time: '7:30 PM',
    venue: 'M. A. Chidambaram Stadium, Chennai',
    prices: { General: 1200, Premium: 3000, VIP: 6500 },
  },
  {
    id: 'match-03',
    teams: 'DC vs SRH',
    date: 'April 7, 2026',
    time: '7:30 PM',
    venue: 'Arun Jaitley Stadium, Delhi',
    prices: { General: 1000, Premium: 2500, VIP: 5500 },
  },
]

function App() {
  const [selectedMatch, setSelectedMatch] = useState(null)

  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Hero />

        <section className="matches-section" id="matches" aria-labelledby="matches-heading">
          <div className="section-heading">
            <p className="eyebrow">IPL 2026</p>
            <h2 id="matches-heading">Upcoming Matches</h2>
            <p>Choose a match to see your selection summary.</p>
          </div>

          <div className="match-grid">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isSelected={selectedMatch?.id === match.id}
                onSelect={setSelectedMatch}
              />
            ))}
          </div>
        </section>

        <section className="selection-panel" id="selection" aria-live="polite" aria-atomic="true">
          <p className="eyebrow">Your selection</p>
          {selectedMatch ? (
            <>
              <h2>{selectedMatch.teams}</h2>
              <p>{selectedMatch.date} at {selectedMatch.time}</p>
              <p>{selectedMatch.venue}</p>
            </>
          ) : (
            <p>Select a match to see its details here.</p>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>&copy; 2026 IPL Ticket Booking</p>
      </footer>
    </div>
  )
}

export default App
