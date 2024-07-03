import { AppShell, Burger, Group, ScrollArea, Text, NavLink, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Outlet, useNavigate } from "react-router-dom";
import { IconChevronRight, IconTools } from '@tabler/icons-react';
import SpotLightSearch from './SpotLightSearch';
import { categoryList } from '../../data/routeData';
import ToggleThemeBtn from './ToggleThemeBtn';

function Layout() {
    const navigate = useNavigate()
    const [opened, { toggle, close }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 250,
                breakpoint: 'sm',
                collapsed: { mobile: !opened }
            }}
            padding="md"
        >

            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">

                    <UnstyledButton onClick={() => navigate(`/`)}>
                        <Group>
                            <IconTools size={24} />
                            <Text fw={300} fz={20} ml={-10}>
                                Tools Box
                            </Text>
                        </Group>
                    </UnstyledButton>

                    <Group visibleFrom="sm">
                        <SpotLightSearch />
                        <ToggleThemeBtn />
                    </Group>

                    <Group hiddenFrom="sm">
                        <Burger opened={opened} onClick={toggle} size="sm" />
                        <ToggleThemeBtn />
                    </Group>

                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">

                <AppShell.Section>
                    <SpotLightSearch mb={16} hiddenFrom="sm" />
                    <Text fz={14} fw={300}>
                        Tools
                    </Text>
                </AppShell.Section>

                <AppShell.Section
                    grow my="md"
                    component={ScrollArea}
                    scrollbarSize={2}
                >
                    {
                        categoryList.map((v) => (
                            <NavLink
                                key={v.link}
                                label={v.labels}
                                leftSection={
                                    <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
                                }
                                onClick={() => {
                                    navigate(`/${v.link}`);
                                    close();
                                }}
                            />
                        )
                    )}
                </AppShell.Section>

                <AppShell.Section>
                    <Group justify="space-between">

                    </Group>
                </AppShell.Section>

            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>

        </AppShell>
    );
}

export default Layout
