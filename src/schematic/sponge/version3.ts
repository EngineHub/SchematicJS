import { Int, Short, Tag, TagMap } from 'nbt-ts';
import { Block, Schematic } from '../types';

export function loadVersion3(tag: Tag): Schematic {
    const blocksContainer = (tag as any).get('Blocks') as TagMap;
    const blocks = blocksContainer.get('Data') as Buffer;
    const width = ((tag as any).get('Width') as Short).value;
    const height = ((tag as any).get('Height') as Short).value;
    const length = ((tag as any).get('Length') as Short).value;
    const dataVersion = ((tag as any).get('DataVersion') as Int).value;

    const palette = new Map<number, Block>();
    // eslint-disable-next-line prefer-const
    for (let [key, value] of (
        blocksContainer.get('Palette') as TagMap
    ).entries()) {
        // sanitize the block name
        const colonIndex = key.indexOf(':');
        if (colonIndex !== -1) {
            key = key.substring(colonIndex + 1);
        }

        const properties = {};

        const bracketIndex = key.indexOf('[');
        let type: string;
        if (bracketIndex !== -1) {
            type = key.substring(0, bracketIndex);
            const propertyArea = key.substring(
                bracketIndex + 1,
                key.length - 1
            ) as string;
            propertyArea.split(',').forEach(prop => {
                const pair = prop.split('=');
                properties[pair[0]] = pair[1];
            });
        } else {
            type = key;
        }

        palette.set((value as Int).value, { type, properties });
    }

    const schematic = new Schematic({
        width,
        height,
        length,
        blockTypes: [...palette.values()],
        dataVersion,
    });
    let index = 0;
    let i = 0;
    while (i < blocks.length) {
        let value = 0;
        let varintLength = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            value |= (blocks[i] & 127) << (varintLength++ * 7);
            if (varintLength > 5) {
                throw new Error('VarInt too big');
            }
            if ((blocks[i] & 128) != 128) {
                i++;
                break;
            }
            i++;
        }

        const y = Math.floor(index / (width * length));
        const z = Math.floor((index % (width * length)) / width);
        const x = (index % (width * length)) % width;

        index++;

        const block = palette.get(value);
        schematic.setBlock({ x, y, z }, block);
    }

    return schematic;
}
