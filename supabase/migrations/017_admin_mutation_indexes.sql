-- Indexes that support admin catalog/order mutations (FK checks + filters).
-- categories.parent_id is already indexed in 002_company_domain_extensions.sql.

CREATE INDEX IF NOT EXISTS order_items_product_id_idx
  ON public.order_items (product_id);

CREATE INDEX IF NOT EXISTS product_sizes_size_id_idx
  ON public.product_sizes (size_id);
