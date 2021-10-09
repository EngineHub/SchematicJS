import { Int, TagArray, TagMap } from 'nbt-ts';
import { Block, Schematic } from '../types';

const DEFAULT_DV = 1913;

export function loadStructure(tag: TagMap): Schematic {
    const size = tag.get('size') as TagArray;
    const width = (size[0] as Int).value;
    const height = (size[1] as Int).value;
    const length = (size[2] as Int).value;

    const blocks = tag.get('blocks') as TagArray;
    const dvTag = tag.get('DataVersion') as Int;
    const dataVersion = dvTag
        ? (tag.get('DataVersion') as Int).value
        : DEFAULT_DV;

    const palette = new Map<number, Block>();
    // eslint-disable-next-line prefer-const
    for (let paletteIndex in tag.get('palette') as TagArray) {
        const paletteEntry = (tag.get('palette') as TagArray)[
            paletteIndex
        ] as TagMap;
        let type = paletteEntry.get('Name') as string;

        // sanitize the block name
        const colonIndex = type.indexOf(':');
        if (colonIndex !== -1) {
            type = type.substring(colonIndex + 1);
        }

        const properties = {};
        const propertiesTag = paletteEntry.get('Properties');
        if (propertiesTag) {
            for (const [property, value] of (
                propertiesTag as TagMap
            ).entries()) {
                properties[property] = value;
            }
        }

        palette.set(parseInt(paletteIndex), { type, properties });
    }
    console.log(palette);

    const schematic = new Schematic({
        width,
        height,
        length,
        blockTypes: [...palette.values()],
        dataVersion
    });
    for (const block of blocks) {
        const state = ((block as TagMap).get('state') as Int).value;
        const blockState = palette.get(state);

        const pos = (block as TagMap).get('pos') as TagArray;
        const x = (pos[0] as Int).value;
        const y = (pos[1] as Int).value;
        const z = (pos[2] as Int).value;

        schematic.setBlock({ x, y, z }, blockState);
    }

    return schematic;
}
