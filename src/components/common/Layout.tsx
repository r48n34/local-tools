import { AppShell, Burger, Group, ScrollArea, Text, NavLink, UnstyledButton, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Outlet, useNavigate } from "react-router-dom";
import { IconBrandGithubFilled, IconChevronRight, IconTools } from '@tabler/icons-react';
import SpotLightSearch from './SpotLightSearch';
import { categoryList } from '../../data/routeData';
import ToggleThemeBtn from './ToggleThemeBtn';
import GoUrlBtn from './GoUrlBtn';
import FooterComp from './FooterComp';

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
                        <GoUrlBtn title="Github" url={"https://github.com/r48n34/local-tools"} icon={<IconBrandGithubFilled size={16}/>}/>
                    </Group>

                    <Group hiddenFrom="sm">
                        <Burger opened={opened} onClick={toggle} size="sm" />
                        <ToggleThemeBtn />
                        <GoUrlBtn title="Github" url={"https://github.com/r48n34/local-tools"} icon={<IconBrandGithubFilled size={16}/>}/>
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
                        categoryList.filter(v => v.displayAtNav).map((v) => (
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

            </AppShell.Navbar>

            <AppShell.Main style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
                <Box style={{ flex: 1 }}>
                    <Outlet />
                </Box>
                <FooterComp />
            </AppShell.Main>


        </AppShell>
    );
}

export default Layout
