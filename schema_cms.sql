-- CMS content defaults for all pages
-- Run: npx wrangler d1 execute cakenest-careers-db --remote --file=schema_cms.sql

INSERT OR IGNORE INTO content (key, value) VALUES
  -- Home page
  ('home:hero_sub',   'Learn a skill. Showcase it. Earn from it. Build a business from your own home.'),
  ('home:hero_img_1', 'women-community'),
  ('home:hero_img_2', 'women-learning'),
  ('home:hero_img_3', 'entrepreneur-portrait'),
  ('home:who_intro',  'CakeNest is a women-led movement turning India''s home kitchens into thriving businesses. We help women learn a skill, sharpen it, show it to the world and earn from it, at their own pace and from their own homes.'),
  -- About page
  ('about:hero_title', 'Driven by purpose. Built for *her.*'),
  ('about:hero_sub',   'We exist so that every woman with a skill has the tools, the audience and the confidence to earn from it.'),
  ('about:hero_img',   'women-group'),
  -- Impact page
  ('impact:hero_title', '98% women. One shared *rise.*'),
  ('impact:hero_sub',   'When a woman earns from her own skill, the change reaches her family, her street and her city.'),
  -- Programs page
  ('programs:hero_title', 'Everything she needs, in *one place.*'),
  ('programs:hero_sub',   'Six programs, one path. Start with the one you need today and add the rest as you grow.'),
  -- Stories page
  ('stories:hero_title', 'Real kitchens. Real *brands.*'),
  ('stories:hero_sub',   'Different cities, different ages, different dreams. Tap a story to hear it from them.'),
  -- Partner page
  ('partner:hero_title', 'Grow with the women who bake India''s *celebrations.*'),
  ('partner:hero_sub',   'Brands work with CakeNest to reach a community that learns, creates and buys every day, and to support women-led businesses while they do it.'),
  -- Join page
  ('join:hero_title', 'Your kitchen is where it *starts.*'),
  ('join:hero_sub',   'Tell us where you are today and what you''d love to build. Someone from our team will walk the rest of the way with you.'),
  -- Careers page
  ('careers:hero_title',    'Build the future of home baking *with us.*'),
  ('careers:hero_sub',      'We are a small, passionate team helping India''s women home bakers learn, earn and build businesses. Come help us grow the movement.'),
  ('careers:hero_img',      'women-community'),
  ('careers:culture_title', 'A place where your work has *real impact.*'),
  ('careers:culture_body',  'We are a mission-first team. Every line of code, every campaign, every class we run has one goal — helping women become entrepreneurs. If that excites you, you will fit right in.');
