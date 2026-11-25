function Navbar() {
  return (
    <header className="site-header">
      <a className="brand" href="#home">IPL Tickets</a>
      <nav aria-label="Main navigation">
        <a href="#matches">Matches</a>
        <a href="#selection">My selection</a>
      </nav>
    </header>
  )
}

export default Navbar
