'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppShell,
  Burger,
  Group,
  Text,
  ActionIcon,
  NavLink,
  Stack,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

type NavItem = {
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
};

type AppShellLayoutProps = {
  children: ReactNode;
  /** Title shown in sidebar header */
  sidebarTitle?: string;
  /** Subtitle shown below sidebar title */
  sidebarSubtitle?: string;
  /** Custom navigation items (defaults provided if not specified) */
  navItems?: NavItem[];
  /** Extra content to show in the header center */
  headerCenter?: ReactNode;
  /** Extra content to show in the header right (before theme toggle) */
  headerRight?: ReactNode;
};

export function AppShellLayout({
  children,
  sidebarTitle,
  sidebarSubtitle,
  navItems,
  headerCenter,
  headerRight,
}: AppShellLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering color scheme icon after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Default navigation items
  const defaultNavItems: NavItem[] = [
    {
      label: 'All Campaigns',
      icon: '📋',
      href: '/campaigns',
    },
    {
      label: 'Profile',
      icon: '👤',
      href: '/profile',
    },
    {
      label: 'Settings',
      icon: '⚙️',
      onClick: () => closeNav(),
    },
    {
      label: 'Help',
      icon: '❓',
      onClick: () => closeNav(),
    },
  ];

  const navigationItems = navItems || defaultNavItems;

  const handleNavClick = (item: NavItem) => {
    closeNav();
    if (item.href) {
      router.push(item.href);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { desktop: !navOpened, mobile: !navOpened },
      }}
      padding={0}
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={navOpened} onClick={toggleNav} size="sm" />
            <Text
              fw={700}
              size="lg"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/campaigns')}
            >
              Muninn
            </Text>
          </Group>

          {headerCenter && (
            <Group style={{ flex: 1 }} justify="center">
              {headerCenter}
            </Group>
          )}

          <Group gap="md">
            {headerRight}
            <ActionIcon
              variant="subtle"
              onClick={() => toggleColorScheme()}
              size="lg"
              title="Toggle color scheme"
            >
              {mounted ? (colorScheme === 'dark' ? '☀️' : '🌙') : '🌙'}
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              onClick={() => router.push('/profile')}
              size="lg"
              title="Profile"
            >
              👤
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navigation Sidebar */}
      <AppShell.Navbar p="md">
        {(sidebarTitle || sidebarSubtitle) && (
          <Stack gap="xs" mb="xl">
            {sidebarTitle && (
              <Text size="lg" fw={500}>
                {sidebarTitle}
              </Text>
            )}
            {sidebarSubtitle && (
              <Text size="sm" c="dimmed">
                {sidebarSubtitle}
              </Text>
            )}
          </Stack>
        )}

        <Stack gap={0}>
          {navigationItems.map((item, index) => (
            <NavLink
              key={index}
              label={item.label}
              leftSection={<Text>{item.icon}</Text>}
              active={item.href === pathname}
              onClick={() => handleNavClick(item)}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
