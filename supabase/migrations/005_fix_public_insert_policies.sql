-- Fix public website inserts (anon role)

GRANT SELECT, INSERT ON TABLE public.inquiries TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.orders TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.order_items TO anon, authenticated;

-- Recreate permissive public insert policies (WITH CHECK only)
DROP POLICY IF EXISTS inquiries_public_insert ON public.inquiries;
CREATE POLICY inquiries_public_insert
  ON public.inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS orders_public_insert ON public.orders;
CREATE POLICY orders_public_insert
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS order_items_public_insert ON public.order_items;
CREATE POLICY order_items_public_insert
  ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Note: SELECT on inquiries/orders remains company-member-only (no public SELECT policies for those tables beyond grants that RLS still blocks)
