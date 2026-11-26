function MatchCard({ match, isSelected, onSelect }) {
  return (
    <article className={`match-card${isSelected ? ' is-selected' : ''}`}>
      <div className="match-card-heading">
        <span className="match-number">{match.id.replace('match-', 'Match ')}</span>
        <h3>{match.teams}</h3>
      </div>
      <p className="match-time">{match.date} &middot; {match.time}</p>
      <p className="match-venue">{match.venue}</p>
      <p className="available-seats">
        {match.available_seats.toLocaleString('en-IN')} seats available
      </p>

      <dl className="price-list">
        {Object.entries(match.prices).map(([category, price]) => (
          <div className="price-item" key={category}>
            <dt>{category}</dt>
            <dd>Rs. {price.toLocaleString('en-IN')}</dd>
          </div>
        ))}
      </dl>

      <button
        className="button match-select"
        type="button"
        disabled={match.available_seats === 0}
        aria-pressed={isSelected}
        onClick={() => onSelect(match)}
      >
        {match.available_seats === 0 ? 'Sold out' : isSelected ? 'Selected' : 'Select match'}
      </button>
    </article>
  )
}

export default MatchCard
