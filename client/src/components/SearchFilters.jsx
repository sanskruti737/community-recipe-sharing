import { SearchIcon } from './Icons.jsx';

export const categories = ['Breakfast', 'Lunch', 'Dessert', 'Vegan'];

const SearchFilters = ({ filters, onChange, onClear }) => (
  <section className="filters" aria-label="Search and filter recipes">
    <div className="filters__inputs">
      <label className="search-field">
        <SearchIcon />
        <span className="sr-only">Search by title</span>
        <input
          type="search"
          placeholder="Search recipes by title..."
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
      </label>
      <label className="search-field">
        <SearchIcon />
        <span className="sr-only">Search by ingredient</span>
        <input
          type="search"
          placeholder="Search by ingredient, e.g. avocado"
          value={filters.ingredient}
          onChange={(event) => onChange({ ...filters, ingredient: event.target.value })}
        />
      </label>
      <select
        aria-label="Sort recipes"
        value={filters.sort}
        onChange={(event) => onChange({ ...filters, sort: event.target.value })}
      >
        <option value="newest">Newest first</option>
        <option value="popular">Most loved</option>
        <option value="quickest">Quickest first</option>
      </select>
    </div>
    <div className="filters__bottom">
      <div className="category-filters" role="group" aria-label="Category filters">
        <button type="button" className={filters.category === '' ? 'chip is-selected' : 'chip'} onClick={() => onChange({ ...filters, category: '' })}>All</button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={filters.category === category ? 'chip is-selected' : 'chip'}
            onClick={() => onChange({ ...filters, category })}
          >
            {category}
          </button>
        ))}
      </div>
      {(filters.search || filters.ingredient || filters.category) && (
        <button type="button" className="clear-button" onClick={onClear}>Clear filters</button>
      )}
    </div>
  </section>
);

export default SearchFilters;
