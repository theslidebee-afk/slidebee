export interface NavLinkItem {
  name: string;
  path: string;
  isHash?: boolean;
  hasDropdown?: boolean;
}

export const navLinks: NavLinkItem[] = [
  { name: "Templates", path: "/#templates", isHash: true },
  { name: "Services", path: "/services", hasDropdown: true },
  { name: "Pricing", path: "/pricing" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Blog", path: "/blog" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];
