# RecipeHaven — Community Recipe Sharing Platform

RecipeHaven is a full stack community recipe application where people can discover, share, edit, like and save recipes. It is built with React, Express, SQLite and a small REST API, and it works on mobile and desktop.

This is the second CodeNova Full Stack Development Internship project.

## Features

- Modern, responsive homepage with a hero section and live community stats
- Add new recipes with title, description, ingredients, instructions, prep time, difficulty, category, author and image
- Edit and delete recipes from the feed, detail page and forms
- Ingredients and cooking instructions stored as structured lists
- Image upload with MIME type checks, magic-byte checks, 5 MB limit and random filenames
- Explore feed with newest / most loved / quickest sorting
- Like and favorite functionality persisted per visitor in SQLite
- Search by recipe title and by ingredient
- Category filters: Breakfast, Lunch, Dessert and Vegan
- Full recipe detail page with ingredients, numbered steps and actions
- Favorites page for saved recipes
- Field-level validation and centralized error handling

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8, HTML5, CSS3, JavaScript |
| Backend | Node.js, Express 5, REST API |
| Database | SQLite via `better-sqlite3` |
| Uploads | Multer with custom validation |
| Security | Helmet, CORS, parameterized SQL queries |
| Tooling | ESLint, Node test runner, Supertest, concurrently |

## Project structure

```text
.
├── client/
│   ├── public/images/demo/       # bundled demo recipe artwork
│   ├── src/
│   │   ├── components/           # header, footer, cards, filters, icons, toast
│   │   ├── hooks/                # shared like/favorite/delete actions
│   │   ├── pages/                # home, detail, form, favorites
│   │   ├── services/api.js       # all frontend API calls
│   │   └── styles/index.css      # complete responsive design
│   ├── index.html
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config.js
│   │   ├── db/                   # SQLite connection, schema and demo seed
│   │   ├── middleware/           # upload, validation, errors
│   │   ├── routes/               # API routes
│   │   ├── services/recipes.js   # database queries
│   │   ├── app.js
│   │   └── server.js
│   ├── test/api.test.js
│   └── uploads/                  # runtime uploads (gitignored)
├── screenshots/                  # add UI screenshots here
├── eslint.config.js
└── package.json
```

## Installation

Requirements: Node.js 20.19+ and npm.

```bash
git clone https://github.com/sanskruti737/community-recipe-sharing.git
cd community-recipe-sharing
npm install
npm run dev
```

Open:

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/health

The first server start creates `server/data/recipes.db` and seeds six demo recipes. To start with an empty database, run the server with `SEED_DEMO=false`.

### Environment variables

Copy `.env.example` if you want to override defaults. The backend currently reads `PORT`, `DB_PATH`, `UPLOAD_DIR`, `MAX_IMAGE_SIZE_MB`, `CLIENT_URL` and `SEED_DEMO` from the process environment.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Express server port |
| `DB_PATH` | `server/data/recipes.db` | SQLite database file |
| `UPLOAD_DIR` | `server/uploads` | Image upload directory |
| `MAX_IMAGE_SIZE_MB` | `5` | Maximum uploaded image size |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `SEED_DEMO` | unset | Set to `false` to skip demo data |

### Production build

```bash
npm run build
npm start
```

Express then serves the built React app from `client/dist` and the API from the same origin on port 5000.

## API documentation

Base URL: `http://localhost:5000/api`

The frontend stores a UUID in `localStorage` and sends it as the `x-visitor-id` header. This identifies likes and favorites without requiring accounts. The header is optional; requests without it use `anonymous`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/stats` | Total recipes, likes and favorites |
| `GET` | `/recipes` | List recipes with search, filters and sorting |
| `GET` | `/recipes/:id` | Get one recipe |
| `POST` | `/recipes` | Create a recipe (`multipart/form-data`) |
| `PUT` | `/recipes/:id` | Replace a recipe (`multipart/form-data`) |
| `DELETE` | `/recipes/:id` | Delete a recipe and its image/reactions |
| `POST` | `/recipes/:id/like` | Toggle a like |
| `POST` | `/recipes/:id/favorite` | Toggle a favorite |

### Query parameters for `GET /recipes`

| Parameter | Example | Description |
| --- | --- | --- |
| `search` | `banana` | Case-insensitive title search |
| `ingredient` | `milk` | Case-insensitive ingredient search |
| `category` | `Vegan` | `Breakfast`, `Lunch`, `Dessert` or `Vegan` |
| `sort` | `popular` | `newest`, `popular` or `quickest` |

Example:

```text
GET /api/recipes?search=banana&category=Breakfast&sort=quickest
```

### Recipe payload

Send `multipart/form-data` with these fields:

| Field | Type | Rules |
| --- | --- | --- |
| `title` | string | 3–100 characters, required |
| `description` | string | 10–2000 characters, required |
| `ingredients` | newline-separated text | At least 1 item, required |
| `instructions` | newline-separated text | At least 1 item, required |
| `prepTime` | number | 1–10080 minutes, required |
| `difficulty` | string | `Easy`, `Medium` or `Hard` |
| `category` | string | `Breakfast`, `Lunch`, `Dessert` or `Vegan` |
| `author` | string | 2–50 characters, optional (default `Anonymous`) |
| `image` | file | JPEG, PNG, GIF or WebP, max 5 MB, optional |

JSON arrays are also accepted for `ingredients` and `instructions`.

### Example responses

```json
{
  "count": 1,
  "recipes": [
    {
      "id": 1,
      "title": "Fluffy Banana Pancakes",
      "description": "Golden, airy pancakes...",
      "ingredients": ["2 ripe bananas", "1 cup all-purpose flour"],
      "instructions": ["Mash the bananas.", "Cook on a skillet."],
      "prepTime": 20,
      "difficulty": "Easy",
      "category": "Breakfast",
      "image": "/images/demo/pancakes.svg",
      "author": "Maya Chen",
      "createdAt": "2026-11-22 08:00:00",
      "updatedAt": "2026-11-22 08:00:00",
      "likes": 2,
      "favorites": 1,
      "likedByMe": false,
      "favoritedByMe": false
    }
  ]
}
```

```json
{ "kind": "favorite", "active": true, "count": 4 }
```

Validation failures return HTTP 422:

```json
{
  "error": "Please correct the highlighted fields.",
  "details": [{ "field": "title", "message": "Title must be between 3 and 100 characters." }]
}
```

## Database schema

```sql
CREATE TABLE recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT NOT NULL,          -- JSON array
  instructions TEXT NOT NULL,         -- JSON array
  prep_time INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  category TEXT NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Dessert', 'Vegan')),
  image TEXT,                         -- /uploads/<file> or bundled demo image
  author TEXT NOT NULL DEFAULT 'Anonymous',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE likes (
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (recipe_id, visitor_id)
);

CREATE TABLE favorites (
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (recipe_id, visitor_id)
);
```

Indexes exist on `recipes.category`, `recipes.created_at`, `likes.recipe_id` and `favorites.recipe_id`. Foreign keys and WAL journal mode are enabled.

## Testing

```bash
npm test        # 9 API integration tests
npm run lint    # ESLint across client and server
npm run build   # production React build
```

The test suite uses a temporary SQLite database and upload directory, so it never touches your real data. It covers health/stats, create, validation, unsafe image rejection, title and ingredient search, category filters, sorting, read, update, persistence, likes, favorites, delete cascades and error handling.

### Verified results

| Check | Result |
| --- | --- |
| API integration tests | 9/9 passed |
| CRUD operations | passed |
| Search and category filters | passed |
| Likes and favorites | passed |
| Image upload validation | passed |
| SQLite persistence | passed |
| ESLint | passed |
| Production build | passed |

## Screenshots

Put captured UI screenshots in the [`screenshots/`](screenshots/) directory, for example `home.png`, `recipe-detail.png`, `add-recipe.png` and `favorites.png`. The directory is included in the repository and is ready for those captures.

## Notes

- No authentication is implemented. Likes and favorites are keyed by a random browser visitor ID.
- Recipe edit and delete controls are intentionally available in this demo because there are no user accounts.
- Do not commit the SQLite database, uploaded images, `.env` files or build output; they are covered by `.gitignore`.
