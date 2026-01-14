import { Container, Title, Text, Button, Stack } from "@mantine/core";

export default function Home() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Title order={1}>Muninn</Title>
        <Text c="dimmed">TTRPG Combat Manager</Text>
        <Button>Get Started</Button>
      </Stack>
    </Container>
  );
}
