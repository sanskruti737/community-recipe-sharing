import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="site-footer">
    <div className="container site-footer__inner">
      <div>
        <strong>RecipeHaven</strong>
        <p>Good food is better when shared.</p>
      </div>
      <div className="site-footer__links">
        <Link to="/">Explore recipes</Link>
        <Link to="/recipes/new">Share a recipe</Link>
        <Link to="/favorites">Saved recipes</Link>
      </div>
      <p className="site-footer__copy">© {new Date().getFullYear()} RecipeHaven · Built with React, Express & SQLite</p>
    </div>
  </footer>
);

export default Footer;
