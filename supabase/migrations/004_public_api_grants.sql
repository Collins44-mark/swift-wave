-- =============================================================================
-- Phase 6 — Grants for public website APIs (anon insert/select)
-- Migration: 004_public_api_grants.sql
-- =============================================================================

GRANT SELECT ON TABLE public.categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;

GRANT SELECT, INSERT ON TABLE public.inquiries TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.inquiries TO authenticated;

GRANT INSERT ON TABLE public.orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;

GRANT INSERT ON TABLE public.order_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_items TO authenticated;
