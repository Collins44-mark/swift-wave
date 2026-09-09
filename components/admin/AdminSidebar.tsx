"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentAdmin } from "@/lib/auth/types";
import { signOutAction } from "@/lib/auth/actions";
import { useAdminShell } from "@/components/admin/AdminShell";
import { userInitials, roleLabel } from "@/lib/admin/labels";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  superOnly?: boolean;
};

function Icon({ path }: { path: string }) {
  return (
    <svg className="sw-admin-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarCloseIcon() {
  return (
    <span className="sw-admin-hamburger" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

const MAIN_NAV: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <Icon path="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />,
  },
  {
    href: "/admin/companies",
    label: "Companies",
    icon: <Icon path="M4 20V8.5L12 4l8 4.5V20M9 20v-6h6v6" />,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: <Icon path="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Zm8 4.5V20m0-7 8-4.5M12 13 4 8.5" />,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: <Icon path="M4 7h16M4 12h16M4 17h10" />,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: <Icon path="M7 7h13l-1.5 8.5H8.5L7 7Zm0 0L6 4H3m5 16a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 8 20Zm10 0a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 18 20Z" />,
  },
  {
    href: "/admin/website-content",
    label: "Website Content",
    icon: <Icon path="M5 5h14v14H5V5Zm3 4h8M8 12h8M8 15h5" />,
  },
  {
    href: "/admin/media",
    label: "Media",
    icon: <Icon path="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11ZM8 14l2.5-3 2 2.5L15 11l3 4H8Z" />,
  },
  {
    href: "/admin/whatsapp",
    label: "WhatsApp",
    icon: <Icon path="M7 17.5 5.5 20l2.7-.7A8 8 0 1 0 7 17.5Zm4.2-7.3c.3-.2.5-.1.7.2l.7 1.5c.1.2 0 .5-.2.6l-.5.3c.7 1.3 1.8 2.3 3.1 3l.3-.5c.2-.2.4-.3.6-.2l1.5.7c.3.1.4.4.2.7l-.7 1.2c-.2.3-.5.4-.8.3A9.5 9.5 0 0 1 8.5 9.3c-.1-.3 0-.6.3-.8l1.2-.7Z" />,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <Icon path="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm7.2-3.5-.9-.5.1-1-1.4-2.1-1.1.2-.7-.8V6.2h-2.5v1.3l-.7.8-1.1-.2-1.4 2.1.1 1-.9.5-.9 1.1.9.5-.1 1 1.4 2.1 1.1-.2.7.8v1.3h2.5v-1.3l.7-.8 1.1.2 1.4-2.1-.1-1 .9-.5.9-1.1-.9-.5Z" />,
  },
];

const ADMIN_NAV: NavItem[] = [
  {
    href: "/admin/settings/users",
    label: "Administrators",
    icon: <Icon path="M16 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 19.5a6 6 0 0 1 12 0" />,
    superOnly: true,
  },
  {
    href: "/admin/settings",
    label: "Roles & Permissions",
    icon: <Icon path="M12 3.5l7.5 4.3v8.4L12 20.5 4.5 16.2V7.8L12 3.5Zm0 4.2v8.6" />,
    superOnly: true,
  },
  {
    href: "/admin/settings",
    label: "Activity Logs",
    icon: <Icon path="M4 6.5h16M4 12h10M4 17.5h7" />,
    superOnly: true,
  },
  {
    href: "/admin/settings",
    label: "System Settings",
    icon: <Icon path="M10.5 6.5h3M7 10.5h10M8.5 14.5h7" />,
    superOnly: true,
  },
];

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active =
    pathname === item.href ||
    (item.href !== "/admin/dashboard" && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      className={active ? "is-active" : undefined}
      aria-current={active ? "page" : undefined}
      title={item.label}
      onClick={onNavigate}
    >
      {item.icon}
      <span className="sw-admin-nav-label">{item.label}</span>
      {item.badge ? (
        <span className="sw-admin-nav-count">{item.badge}</span>
      ) : null}
    </Link>
  );
}

export function AdminSidebar({
  admin,
  onNavigate,
}: {
  admin: CurrentAdmin;
  onNavigate?: () => void;
  companyCount?: number;
}) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAdminShell();
  const isSuper = admin.profile.role === "super_admin";
  const displayName =
    admin.profile.full_name?.trim() ||
    (isSuper ? "Super Admin" : roleLabel(admin.profile.role));
  const orgSubtitle = isSuper ? "Swift Wave Group" : roleLabel(admin.profile.role);

  const mainNav = MAIN_NAV;

  return (
    <aside
      className="sw-admin-sidebar sw-admin-sidebar--dark"
      aria-label="Admin sidebar"
      data-collapsed={sidebarCollapsed ? "true" : "false"}
    >
      <button
        type="button"
        className="sw-admin-sidebar-close"
        aria-label="Close sidebar"
        title="Close sidebar"
        onClick={toggleSidebar}
      >
        <SidebarCloseIcon />
      </button>

      <div className="sw-admin-brand sw-admin-brand--stacked">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/logo.png" alt="" className="sw-admin-brand-logo" />
        <div className="sw-admin-brand-copy sw-admin-brand-copy--centered">
          <span className="sw-admin-brand-line sw-admin-brand-line--gold">Swift Wave</span>
          <span className="sw-admin-brand-line sw-admin-brand-line--gold">Group</span>
          <span className="sw-admin-brand-console">Admin Console</span>
        </div>
      </div>

      <nav className="sw-admin-nav" aria-label="Primary">
        {mainNav.map((item) => (
          <NavLink
            key={item.href + item.label}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {isSuper ? (
        <>
          <div className="sw-admin-nav-divider" aria-hidden="true" />
          <p className="sw-admin-nav-section-label">Administration</p>
          <nav className="sw-admin-nav sw-admin-nav--secondary" aria-label="Administration">
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </nav>
        </>
      ) : null}

      <div className="sw-admin-sidebar-profile">
        <div className="sw-admin-sidebar-profile-main">
          <span className="sw-admin-avatar sw-admin-avatar-sidebar" aria-hidden="true">
            {userInitials(admin.profile.full_name, admin.user.email)}
          </span>
          <div className="sw-admin-user-meta">
            <strong>{displayName}</strong>
            <span>{orgSubtitle}</span>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="sw-admin-sidebar-logout-icon"
            aria-label="Logout"
            title="Logout"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10 7V5.8A1.8 1.8 0 0 1 11.8 4h6.4A1.8 1.8 0 0 1 20 5.8v12.4a1.8 1.8 0 0 1-1.8 1.8h-6.4A1.8 1.8 0 0 1 10 18.2V17M14 12H4m0 0 2.5-2.5M4 12l2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </aside>
  );
}
