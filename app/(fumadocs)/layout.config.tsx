import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  themeSwitch: {
    enabled: true,
    mode: "light-dark-system",
  },
  nav: {
    title: (
      <div className="flex items-center gap-2">
        <Image
          src="/logo.webp"
          width={100}
          height={100}
          alt="µLearn Logo"
          className="dark:hidden"
          priority
        />
        <Image
          src="/mulearn-logo-dark.webp"
          width={100}
          height={100}
          alt="µLearn Logo"
          className="hidden dark:block"
          loading="lazy"
        />
      </div>
    ),
  },
  links: [],
};
