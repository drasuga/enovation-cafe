import { supabase } from '@/lib/supabase';
import MenuClient from '@/components/MenuClient';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const { table } = await searchParams;

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, sort_order')
    .order('sort_order');

  const { data: items } = await supabase
    .from('menu_items')
    .select('id, category_id, name, description, price, image_url')
    .order('name');

  return (
    <>
      <header className="header">
        <h1>Café Terrasse</h1>
        <p>Enovation Factory</p>
      </header>

      <main className="container">
        <MenuClient
          categories={categories ?? []}
          items={items ?? []}
          initialTable={typeof table === 'string' ? table : ''}
        />
      </main>
    </>
  );
}