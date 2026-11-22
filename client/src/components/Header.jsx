import { NavLink, Link } from 'react-router-dom';
import { PlusIcon, SparkleIcon } from './Icons.jsx';

const Header = () => (
  <header className="site-header">
    <div className="container site-header__inner">
      <Link to="/" className="brand" aria-label="RecipeHaven home">
        <span className="brand__mark"><SparkleIcon /></span>
        <span>Recipe<span>Haven</span></span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <NavLink to="/" end>Explore</NavLink>
        <NavLink to="/favorites">My Favorites</NavLink>
        <Link to="/recipes/new" className="button button--small button--primary">
          <PlusIcon /> <span>Add Recipe</span>
        </Link>
      </nav>
    </div>
  </header>
);

export default Header;
