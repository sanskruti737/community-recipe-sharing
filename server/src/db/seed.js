import { db } from './index.js';

const demoRecipes = [
  {
    title: 'Fluffy Banana Pancakes',
    description: 'Golden, airy pancakes naturally sweetened with ripe banana. A weekend breakfast favourite that comes together in one bowl.',
    ingredients: JSON.stringify(['2 ripe bananas', '1 cup all-purpose flour', '2 tbsp sugar', '1 tsp baking powder', '1 cup milk', '1 egg', '2 tbsp melted butter', 'A pinch of salt']),
    instructions: JSON.stringify(['Mash the bananas in a large bowl until smooth.', 'Whisk in the milk, egg and melted butter.', 'Fold in the flour, sugar, baking powder and salt until just combined.', 'Cook on a lightly greased skillet over medium heat until bubbles form, then flip.', 'Serve warm with maple syrup and fresh berries.']),
    prepTime: 20,
    difficulty: 'Easy',
    category: 'Breakfast',
    image: '/images/demo/pancakes.svg',
    author: 'Maya Chen'
  },
  {
    title: 'Creamy Mushroom Pasta',
    description: 'Silky tagliatelle tossed with garlicky mushrooms, parmesan and a splash of cream for the ultimate comforting lunch.',
    ingredients: JSON.stringify(['250 g tagliatelle', '300 g mixed mushrooms', '3 cloves garlic', '100 ml heavy cream', '60 g parmesan', '2 tbsp olive oil', 'Fresh parsley', 'Salt and black pepper']),
    instructions: JSON.stringify(['Boil the pasta in salted water until al dente.', 'Sauté sliced mushrooms in olive oil until deeply golden.', 'Add minced garlic and cook for one minute.', 'Pour in the cream and simmer until slightly thickened.', 'Toss with pasta, parmesan and parsley.']),
    prepTime: 35,
    difficulty: 'Medium',
    category: 'Lunch',
    image: '/images/demo/pasta.svg',
    author: 'Leo Martin'
  },
  {
    title: 'Lemon Blueberry Cheesecake',
    description: 'A bright and creamy cheesecake with a buttery biscuit base and a glossy blueberry topping. Worth every special occasion.',
    ingredients: JSON.stringify(['200 g digestive biscuits', '100 g melted butter', '500 g cream cheese', '150 g caster sugar', '3 eggs', '100 ml sour cream', '1 lemon, zested', '150 g blueberries']),
    instructions: JSON.stringify(['Crush the biscuits and mix with melted butter, then press into a springform tin.', 'Beat cream cheese with sugar until smooth, then add eggs one at a time.', 'Stir in sour cream and lemon zest.', 'Bake at 160°C for 45 minutes until slightly wobbly.', 'Cool completely before topping with stewed blueberries.']),
    prepTime: 90,
    difficulty: 'Hard',
    category: 'Dessert',
    image: '/images/demo/cheesecake.svg',
    author: 'Nora Patel'
  },
  {
    title: 'Rainbow Chickpea Bowl',
    description: 'A colourful plant-powered bowl with spiced chickpeas, crunchy vegetables and a creamy tahini drizzle.',
    ingredients: JSON.stringify(['1 can chickpeas, drained', '1 tsp smoked paprika', '1 cup quinoa', '1 cucumber, diced', '1 carrot, shredded', '1 avocado', '2 tbsp tahini', '1 lemon']),
    instructions: JSON.stringify(['Cook the quinoa according to the package instructions.', 'Toss chickpeas with smoked paprika and roast at 200°C for 20 minutes.', 'Whisk tahini with lemon juice and water until pourable.', 'Assemble quinoa, vegetables and chickpeas in bowls.', 'Drizzle with tahini sauce and serve.']),
    prepTime: 25,
    difficulty: 'Easy',
    category: 'Vegan',
    image: '/images/demo/bowl.svg',
    author: 'Sam Rivera'
  },
  {
    title: 'Avocado Toast Three Ways',
    description: 'Three quick twists on classic avocado toast: chilli lime, smoked paprika and honey-feta. Perfect for a fast breakfast.',
    ingredients: JSON.stringify(['2 slices sourdough bread', '1 ripe avocado', '1 tbsp lemon juice', 'Chilli flakes', 'Smoked paprika', 'Feta cheese', 'Honey', 'Salt and pepper']),
    instructions: JSON.stringify(['Toast the sourdough until crisp and golden.', 'Mash avocado with lemon juice, salt and pepper.', 'Spread over the toast and add your chosen toppings.', 'Finish with chilli flakes, paprika, feta or a drizzle of honey.']),
    prepTime: 10,
    difficulty: 'Easy',
    category: 'Breakfast',
    image: '/images/demo/toast.svg',
    author: 'Iris Okafor'
  },
  {
    title: 'Chocolate Date Truffles',
    description: 'Fudgy no-bake truffles made from dates, cocoa and nuts. A naturally sweet dessert that satisfies chocolate cravings.',
    ingredients: JSON.stringify(['200 g pitted dates', '100 g almonds', '3 tbsp cocoa powder', '2 tbsp coconut oil', '1 tsp vanilla extract', 'A pinch of sea salt', 'Cocoa for coating']),
    instructions: JSON.stringify(['Blend dates and almonds until a sticky dough forms.', 'Add cocoa, coconut oil, vanilla and salt, then blend again.', 'Roll into small balls with damp hands.', 'Coat in cocoa powder and chill for 20 minutes.']),
    prepTime: 15,
    difficulty: 'Easy',
    category: 'Dessert',
    image: '/images/demo/truffles.svg',
    author: 'Ava Thompson'
  }
];

export const seedDemoRecipes = () => {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM recipes').get();
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO recipes (title, description, ingredients, instructions, prep_time, difficulty, category, image, author)
    VALUES (@title, @description, @ingredients, @instructions, @prepTime, @difficulty, @category, @image, @author)
  `);
  const like = db.prepare('INSERT INTO likes (recipe_id, visitor_id) VALUES (?, ?)');
  const favorite = db.prepare('INSERT INTO favorites (recipe_id, visitor_id) VALUES (?, ?)');

  db.transaction(() => {
    demoRecipes.forEach((recipe, index) => {
      const result = insert.run(recipe);
      const id = result.lastInsertRowid;
      for (let n = 0; n < index + 2; n += 1) {
        like.run(id, `demo-like-${n}`);
      }
      for (let n = 0; n < index + 1; n += 1) {
        favorite.run(id, `demo-fav-${n}`);
      }
    });
  })();

  console.log(`Seeded ${demoRecipes.length} demo recipes.`);
};
