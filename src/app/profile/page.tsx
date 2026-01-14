'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Button,
  Group,
  Loader,
  Center,
  Avatar,
  Divider,
} from '@mantine/core';
import { AppShellLayout } from '@/components/layout/AppShellLayout';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <AppShellLayout sidebarTitle="Profile">
        <Center h="calc(100vh - 60px)">
          <Loader size="lg" />
        </Center>
      </AppShellLayout>
    );
  }

  if (!session?.user) {
    router.push('/login');
    return null;
  }

  const userEmail = session.user.email || 'Unknown';
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <AppShellLayout sidebarTitle="Profile" sidebarSubtitle="Manage your account">
      <Container size="sm" py="xl">
        <Title order={1} mb="xl">
          Profile
        </Title>

        <Card withBorder p="xl">
          <Stack gap="lg">
            {/* Avatar and basic info */}
            <Group>
              <Avatar size="xl" radius="xl" color="blue">
                {userInitial}
              </Avatar>
              <div>
                <Text size="lg" fw={500}>
                  {userEmail}
                </Text>
                <Text size="sm" c="dimmed">
                  Account holder
                </Text>
              </div>
            </Group>

            <Divider />

            {/* Account details */}
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed" tt="uppercase">
                Account Details
              </Text>
              <Group justify="space-between">
                <Text>Email</Text>
                <Text c="dimmed">{userEmail}</Text>
              </Group>
            </Stack>

            <Divider />

            {/* Actions */}
            <Stack gap="sm">
              <Text size="sm" fw={500} c="dimmed" tt="uppercase">
                Actions
              </Text>
              <Button
                variant="light"
                color="red"
                onClick={handleSignOut}
                fullWidth
              >
                Sign Out
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </AppShellLayout>
  );
}
