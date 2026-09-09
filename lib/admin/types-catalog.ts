export type ProductStatus = "draft" | "published" | "archived";
export type OrderStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "completed"
  | "cancelled";
export type InquiryStatus =
  | "new"
  | "read"
  | "replied"
  | "resolved"
  | "contacted"
  | "in_progress"
  | "completed"
  | "cancelled";
export type InquiryType =
  | "scholarship_application"
  | "freight_booking"
  | "general";
export type ContentStatus = "draft" | "published";

export type Product = {
  id: string;
  company_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  image_public_id: string | null;
  status: ProductStatus;
  featured: boolean;
  subcategory: string | null;
  bullets: string[] | unknown;
  rating: string | null;
  price_label: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type Order = {
  id: string;
  company_id: string;
  customer_name: string;
  customer_phone: string;
  customer_location: string | null;
  customer_email: string | null;
  total: number;
  currency: string;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at?: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type OrderItemEnriched = OrderItem & {
  product_image_url: string | null;
  product_category: string | null;
};

export type Inquiry = {
  id: string;
  company_id: string;
  inquiry_type: InquiryType;
  customer_name: string;
  customer_phone: string;
  payload: Record<string, unknown>;
  status: InquiryStatus;
  notes: string | null;
  source: string;
  created_at: string;
  updated_at?: string;
};

export type WebsiteContent = {
  id: string;
  company_id: string;
  page_key: string;
  section_key: string;
  content: Record<string, unknown>;
  status: ContentStatus;
  created_at?: string;
  updated_at?: string;
};

export type CompanySettings = {
  id: string;
  company_id: string;
  settings: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type ActionResult =
  | { ok: true; message?: string; id?: string }
  | { ok: false; error: string };

export const PRODUCT_SELECT =
  "id, company_id, category_id, name, slug, description, price, currency, image_url, image_public_id, status, featured, subcategory, bullets, rating, price_label, sort_order, created_at, updated_at" as const;

export const CATEGORY_SELECT =
  "id, company_id, name, slug, description, parent_id, is_active, sort_order, created_at, updated_at" as const;

export const ORDER_SELECT =
  "id, company_id, customer_name, customer_phone, customer_location, customer_email, total, currency, status, notes, created_at, updated_at" as const;

export const INQUIRY_SELECT =
  "id, company_id, inquiry_type, customer_name, customer_phone, payload, status, notes, source, created_at, updated_at" as const;

export const WEBSITE_CONTENT_SELECT =
  "id, company_id, page_key, section_key, content, status, created_at, updated_at" as const;
