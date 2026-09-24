-- Optional: mirrors src/content/seed.ts so the database starts where the
-- fallback content leaves off. Factual fields are deliberately left null —
-- fill them from /studio rather than inventing them here.

insert into projects (id, slug, title, short_title, one_liner, story_context, logo, palette, order_index, published, featured)
values
  ('haze', 'haze', 'Haze', 'Haze', 'It started with the interface.',
   'The first chapter — where the work was still about surface, rhythm and legibility.',
   '{"id":"haze-logo","url":"/projects/haze/haze-logo.jpg","kind":"image","alt":"Haze logo"}',
   '{"background":"#c9cdf0","foreground":"#14131c","accent":"#8fb7ff"}', 1, true, false),
  ('nite', 'nite', 'Nite', 'Nite', 'Then the interface became an experience.',
   'Softness turned architectural. Geometry started carrying the structure.',
   '{"id":"nite-logo","url":"/projects/nite/nite-logo.jpg","kind":"image","alt":"Nite logo"}',
   '{"background":"#000000","foreground":"#ffffff","accent":"#ffffff"}', 2, true, false),
  ('mun', 'mun', 'MŪN', 'MŪN', 'Then the interface started thinking back.',
   'The turning point — a product that had to make decisions, not just present them.',
   '{"id":"mun-logo","url":"/projects/mun/mun-logo.png","kind":"image","alt":"MŪN logo"}',
   '{"background":"#000000","foreground":"#ffffff","accent":"#8fb8ff"}', 3, true, true),
  ('vaqfa', 'vaqfa', 'Vaqfa', 'Vaqfa', 'Then the work became personal.',
   'A return to craft, language and warmth after the technical chapters.',
   '{"id":"vaqfa-logo","url":"/projects/vaqfa/vaqfa-logo.png","kind":"image","alt":"Vaqfa logo"}',
   '{"background":"#f6f2ea","foreground":"#111010","accent":"#c8912f"}', 4, true, false)
on conflict (id) do nothing;

insert into research (id, slug, title, subtitle, related_project_id, one_liner, research_question, metrics, order_index, published)
values
  ('routing', 'routing', 'Multi-Model Routing', 'Model selection across large language models', 'mun',
   'The product became a question worth measuring.',
   'How should a request be routed across multiple language models, given accuracy, cost, latency, model agreement and reliability?',
   '["Accuracy","Cost","Latency","Model agreement","Reliability"]', 1, true)
on conflict (id) do nothing;

insert into links (id, label, url, order_index, visible, open_in_new_tab) values
  ('github', 'GitHub', 'https://github.com/ZainHafiz06', 1, true, true),
  ('email', 'Email', 'mailto:knight200699@gmail.com', 2, true, false),
  ('linkedin', 'LinkedIn', 'https://www.linkedin.com/in/zain-h-747124296/', 3, true, true),
  ('x', 'X', 'https://x.com/zainhafiz_', 4, true, true)
on conflict (id) do nothing;

insert into settings (id, intro_line, ending_line, seo_title, seo_description, transitions)
values (1, 'I make ideas move.', 'Different projects. Same habit.',
  'Zain Hafiz — High on Java',
  'An interactive portfolio: Haze, Nite, MŪN, multi-model LLM routing research, and Vaqfa — one continuous story.',
  '{"haze":"It started with the interface.","nite":"Then the interface became an experience.","mun":"Then the interface started thinking back.","routing":"The product became a question worth measuring.","vaqfa":"Then the work became personal.","finale":"Different projects. Same habit."}')
on conflict (id) do nothing;
