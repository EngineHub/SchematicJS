import type { Int, Short, TagMap } from '@enginehub/nbt-ts';
import { tagToRecord } from '../../util/nbt.js';
import { type Biome, Schematic } from '../types.js';
import {
    readBiomePalette,
    readBlockPalette,
    readBlockVarintToSchematic
} from './common.js';

function readBiomeVarintToSchematic(
    biomes: Buffer<ArrayBufferLike>,
    biomePalette: Map<number, Biome>,
    schematic: Schematic
): void {
    const { width, length } = schematic;

    let index = 0;
    let i = 0;
    while (i < biomes.length) {
        let value = 0;
        let varintLength = 0;

        while (true) {
            value |= (biomes[i] & 127) << (varintLength++ * 7);
            if (varintLength > 5) {
                throw new Error('VarInt too big');
            }
            if ((biomes[i] & 128) != 128) {
                i++;
                break;
            }
            i++;
        }

        const y = Math.floor(index / (width * length));
        const z = Math.floor((index % (width * length)) / width);
        const x = (index % (width * length)) % width;

        index++;

        const biome = biomePalette.get(value);
        schematic.setBiome({ x, y, z }, biome);
    }
}

export function loadVersion3(tag: TagMap): Schematic {
    const blocksContainer = tag.get('Blocks') as TagMap;
    const blocks = blocksContainer.get('Data') as Buffer;
    const biomesContainer = tag.get('Biomes') as TagMap;
    const width = (tag.get('Width') as Short).value;
    const height = (tag.get('Height') as Short).value;
    const length = (tag.get('Length') as Short).value;
    const dataVersion = (tag.get('DataVersion') as Int).value;
    const metadataTag = tag.get('Metadata') as TagMap;

    const blockPalette = readBlockPalette(
        blocksContainer.get('Palette') as TagMap
    );

    const biomePalette = readBiomePalette(
        biomesContainer?.get?.('Palette') as TagMap
    );

    const metadata: Record<string, unknown> = metadataTag
        ? tagToRecord(metadataTag)
        : {};

    const schematic = new Schematic({
        width,
        height,
        length,
        blockTypes: [...blockPalette.values()],
        biomeTypes: [...biomePalette.values()],
        dataVersion,
        metadata,
        format: {
            type: 'sponge',
            version: 3
        }
    });

    readBlockVarintToSchematic(blocks, blockPalette, schematic);

    if (biomesContainer) {
        const biomes = biomesContainer.get('Data') as Buffer;
        readBiomeVarintToSchematic(biomes, biomePalette, schematic);
    }

    return schematic;
}
