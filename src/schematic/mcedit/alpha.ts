import type { TagMap, Int } from 'nbt-ts';
import type { Block } from '../types.js';
import { Schematic } from '../types.js';
import legacyMapper from './legacy.json';

export function loadMCEditAlpha(tag: TagMap): Schematic {
    const materials = tag.get('Materials') as string;
    const blockIds = tag.get('Blocks') as Buffer;
    const blockData = tag.get('Data') as Buffer;
    const width = (tag.get('Width') as Int).value;
    const height = (tag.get('Height') as Int).value;
    const length = (tag.get('Length') as Int).value;

    const palette = new Map<string, Block>();

    for (let x = 0; x < width; ++x) {
        for (let y = 0; y < height; ++y) {
            for (let z = 0; z < length; ++z) {
                const index = y * width * length + z * width + x;
                const id = `${blockIds[index]}:${blockData[index]}`;
                let key = legacyMapper.blocks[id];
                if (!key) {
                    throw new Error('Unknown legacy block: ' + id);
                }

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

                palette.set(id, { type, properties });
            }
        }
    }

    const schematic = new Schematic({
        width,
        height,
        length,
        blockTypes: [...palette.values()],
        dataVersion: undefined,
        metadata: {},
        format: {
            type: 'mcedit',
            version: materials === 'Alpha' ? 1 : undefined
        }
    });

    for (let x = 0; x < width; ++x) {
        for (let y = 0; y < height; ++y) {
            for (let z = 0; z < length; ++z) {
                const index = y * width * length + z * width + x;
                const id = `${blockIds[index]}:${blockData[index]}`;
                const block = palette.get(id);
                schematic.setBlock({ x, y, z }, block);
            }
        }
    }

    return schematic;
}
