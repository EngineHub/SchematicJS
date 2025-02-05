import type { Int, TagMap } from '@enginehub/nbt-ts';
import type { Biome, Block, Schematic } from '../types.js';

export function readBlockPalette(blockPaletteTag: TagMap): Map<number, Block> {
    const blockPalette = new Map<number, Block>();
    // eslint-disable-next-line prefer-const
    for (let [key, value] of blockPaletteTag.entries()) {
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

        blockPalette.set((value as Int).value, { type, properties });
    }

    return blockPalette;
}

export function readBiomePalette(biomePaletteTag?: TagMap): Map<number, Biome> {
    const biomePalette = new Map<number, Biome>();

    if (biomePaletteTag) {
        // eslint-disable-next-line prefer-const
        for (let [key, value] of biomePaletteTag.entries()) {
            // sanitize the block name
            const colonIndex = key.indexOf(':');
            if (colonIndex !== -1) {
                key = key.substring(colonIndex + 1);
            }
            biomePalette.set((value as Int).value, { type: key });
        }
    }

    return biomePalette;
}

export function readBlockVarintToSchematic(
    blocks: Buffer<ArrayBufferLike>,
    blockPalette: Map<number, Block>,
    schematic: Schematic
): void {
    const { width, length } = schematic;

    let index = 0;
    let i = 0;
    while (i < blocks.length) {
        let value = 0;
        let varintLength = 0;

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

        const block = blockPalette.get(value);
        schematic.setBlock({ x, y, z }, block);
    }
}
