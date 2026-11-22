import { createApp } from './app.js';
import { config } from './config.js';
import { seedDemoRecipes } from './db/seed.js';

if (process.env.SEED_DEMO !== 'false') {
  seedDemoRecipes();
}

const app = createApp();

app.listen(config.port, () => {
  console.log(`RecipeHaven API running at http://localhost:${config.port}`);
});
