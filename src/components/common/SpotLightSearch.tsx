import { TextInput, rem } from "@mantine/core";
import { Spotlight, SpotlightActionGroupData, SpotlightActionData, spotlight } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { categoryList } from "../../data/routeData";

function SpotLightSearch({ ...props }) {

    const navigate = useNavigate()

    const actions: (SpotlightActionGroupData | SpotlightActionData)[] = [
        {
            group: 'Pages',
            actions: categoryList.map( v => ({
                id: v.link,
                label: v.labels,
                description: v.desc,
                leftSection: v.icon,
                onClick: () => navigate(v.link),
            }))
        },
    ];

    return (
        <>
        <Spotlight
            actions={actions}
            nothingFound="Nothing found..."
            highlightQuery
            shortcut={['mod + K', 'mod + P']}
            limit={6}
            searchProps={{
                leftSection: <IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />,
                placeholder: 'Search...',
            }}
        />

        <TextInput
            {...props}
            onClick={() => {
                spotlight.open()
            }}
            placeholder="Search"
            leftSection={<IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />}
        />

        </>
    )
}

export default SpotLightSearch
