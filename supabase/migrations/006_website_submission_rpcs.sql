-- =============================================================================
-- Phase 6 — SECURITY DEFINER RPCs for public website submissions
-- Migration: 006_website_submission_rpcs.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.submit_website_inquiry(
  p_company_slug text,
  p_inquiry_type text,
  p_customer_name text,
  p_customer_phone text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_id uuid;
BEGIN
  IF p_company_slug IS NULL OR length(trim(p_company_slug)) = 0 THEN
    RAISE EXCEPTION 'company_slug required';
  END IF;
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'customer_name required';
  END IF;
  IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'customer_phone required';
  END IF;
  IF p_inquiry_type NOT IN ('scholarship_application', 'freight_booking', 'general') THEN
    RAISE EXCEPTION 'invalid inquiry_type';
  END IF;

  SELECT c.id INTO v_company_id
  FROM public.companies c
  WHERE c.slug = p_company_slug AND c.is_active = true
  LIMIT 1;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'company not found';
  END IF;

  INSERT INTO public.inquiries (
    company_id, inquiry_type, customer_name, customer_phone, payload, status, source
  ) VALUES (
    v_company_id, p_inquiry_type, trim(p_customer_name), trim(p_customer_phone),
    COALESCE(p_payload, '{}'::jsonb), 'new', 'website'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_website_order(
  p_company_slug text,
  p_customer_name text,
  p_customer_phone text,
  p_items jsonb,
  p_customer_location text DEFAULT NULL,
  p_customer_email text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_currency text DEFAULT 'TZS'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_order_id uuid;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_qty integer;
  v_unit numeric(12,2);
  v_sub numeric(12,2);
BEGIN
  IF p_company_slug IS NULL OR length(trim(p_company_slug)) = 0 THEN
    RAISE EXCEPTION 'company_slug required';
  END IF;
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'customer_name required';
  END IF;
  IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'customer_phone required';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'items required';
  END IF;

  SELECT c.id INTO v_company_id
  FROM public.companies c
  WHERE c.slug = p_company_slug AND c.is_active = true
  LIMIT 1;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'company not found';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::integer, 1));
    v_unit := COALESCE((v_item->>'unit_price')::numeric, 0);
    v_total := v_total + (v_qty * v_unit);
  END LOOP;

  INSERT INTO public.orders (
    company_id, customer_name, customer_phone, customer_location, customer_email,
    notes, currency, total, status
  ) VALUES (
    v_company_id, trim(p_customer_name), trim(p_customer_phone),
    NULLIF(trim(COALESCE(p_customer_location, '')), ''),
    NULLIF(trim(COALESCE(p_customer_email, '')), ''),
    NULLIF(trim(COALESCE(p_notes, '')), ''),
    COALESCE(NULLIF(trim(p_currency), ''), 'TZS'),
    v_total,
    'new'
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::integer, 1));
    v_unit := COALESCE((v_item->>'unit_price')::numeric, 0);
    v_sub := v_qty * v_unit;
    INSERT INTO public.order_items (
      order_id, product_id, product_name, quantity, unit_price, subtotal
    ) VALUES (
      v_order_id,
      NULLIF(v_item->>'product_id', '')::uuid,
      COALESCE(NULLIF(trim(v_item->>'product_name'), ''), 'Item'),
      v_qty,
      v_unit,
      v_sub
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_website_inquiry(text, text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_website_order(text, text, text, jsonb, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_website_inquiry(text, text, text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_website_order(text, text, text, jsonb, text, text, text, text) TO anon, authenticated;
