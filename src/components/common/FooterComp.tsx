import { Container, Group, Anchor, Text, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconTools } from '@tabler/icons-react';

import classes from '../../styles/FooterSimple.module.css';

const links = [
    { link: '/', label: 'Home', format: "internal" },
    { link: '/legal', label: 'Legal', format: "internal" },
    { link: 'https://github.com/r48n34/local-tools', label: 'Github', format: "external" },
];

function FooterComp() {
    const navigate = useNavigate();

    const items = links.map((link) => (
        <Anchor<'a'>
            c="dimmed"
            key={link.label}
            href={link.link}
            onClick={(event) => {
                event.preventDefault();
                if (link.format === "internal") {
                    navigate(link.link)
                }
                else {
                    !!window && window.open(link.link, '_blank')
                }
            }}
            size="sm"
        >
            {link.label}
        </Anchor>
    ));

    return (
        <div className={classes.footer} style={{ minHeight: "100%" }}>
            <Container className={classes.inner}>
                <Box>
                    <Group>
                        <IconTools size={24} />
                        <Text fw={300} fz={20} ml={-10}>
                            Tools Box
                        </Text>
                    </Group>

                    <Text c="dimmed" fz={12} mt={4}>
                        © {new Date().getFullYear()} Reemo Studio. All Rights Reserved.
                    </Text>
                </Box>

                <Group className={classes.links}>
                    {items}
                </Group>


            </Container>
        </div>
    );
}

export default FooterComp
