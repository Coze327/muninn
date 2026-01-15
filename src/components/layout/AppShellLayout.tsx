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
import {
  BsSunFill,
  BsMoonFill,
  BsPersonFill,
  BsFolderFill,
  BsGearFill,
  BsQuestionCircleFill,
} from 'react-icons/bs';

type NavItem = {
  label: string;
  icon: ReactNode;
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
  const [navOpened, { toggle: toggleNav, close: closeNav }] =
    useDisclosure(false);
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
      icon: <BsFolderFill size={16} />,
      href: '/campaigns',
    },
    {
      label: 'Profile',
      icon: <BsPersonFill size={16} />,
      href: '/profile',
    },
    {
      label: 'Settings',
      icon: <BsGearFill size={16} />,
      onClick: () => closeNav(),
    },
    {
      label: 'Help',
      icon: <BsQuestionCircleFill size={16} />,
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
      padding={0}>
      {/* Header */}
      <AppShell.Header>
        <Group h='100%' px='md' justify='space-between'>
          <Group>
            <Burger opened={navOpened} onClick={toggleNav} size='sm' />
            <Text
              fw={700}
              size='lg'
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/campaigns')}>
              Goblins Included
            </Text>
          </Group>

          {headerCenter && (
            <Group style={{ flex: 1 }} justify='center'>
              {headerCenter}
            </Group>
          )}

          <Group gap='md'>
            {headerRight}
            <ActionIcon
              variant='subtle'
              onClick={() => toggleColorScheme()}
              size='lg'
              title='Toggle color scheme'>
              {mounted ? (colorScheme === 'dark' ? <BsSunFill size={18} /> : <BsMoonFill size={18} />) : <BsMoonFill size={18} />}
            </ActionIcon>
            <ActionIcon
              variant='subtle'
              onClick={() => router.push('/profile')}
              size='lg'
              title='Profile'>
              <BsPersonFill size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navigation Sidebar */}
      <AppShell.Navbar p='md'>
        {(sidebarTitle || sidebarSubtitle) && (
          <Stack gap='xs' mb='xl'>
            {sidebarTitle && (
              <Text size='lg' fw={500}>
                {sidebarTitle}
              </Text>
            )}
            {sidebarSubtitle && (
              <Text size='sm' c='dimmed'>
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
              leftSection={item.icon}
              active={item.href === pathname}
              onClick={() => handleNavClick(item)}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
