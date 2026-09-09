export type CmsFieldType =
  | "text"
  | "textarea"
  | "html"
  | "url"
  | "image"
  | "cta"
  | "items";

export type CmsFieldDef = {
  key: string;
  label: string;
  type: CmsFieldType;
  /** For image fields */
  altKey?: string;
};

export type CmsSectionDef = {
  key: string;
  label: string;
  description?: string;
  fields: CmsFieldDef[];
  /** Repeatable card/list fields stored under content.items */
  repeatable?: boolean;
};

export type CmsPageDef = {
  key: string;
  label: string;
  route: string;
  sections: CmsSectionDef[];
};

export type CmsScopeDef = {
  slug: string;
  label: string;
  isCorporate: boolean;
  pages: CmsPageDef[];
};

export type CmsSectionRecord = {
  section_key: string;
  content: Record<string, unknown>;
  status: "draft" | "published";
  sort_order: number;
  updated_at?: string;
};

export type CmsPageContent = Record<string, CmsSectionRecord>;
