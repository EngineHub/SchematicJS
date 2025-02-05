import type { Int, Short, TagMap } from '@enginehub/nbt-ts';
import { tagToRecord } from '../../util/nbt.js';
import { type Biome, Schematic } from '../types.js';
import {
    readBiomePalette,
    readBlockPalette,
    readBlockVarintToSchematic
} from './common.js';

const DEFAULT_DV = 1913;

function readBiomeVarintToSchematic(
    biomes: Buffer<ArrayBufferLike>,
    biomePalette: Map<number, Biome>,
    schematic: Schematic
): void {
    const { width, height } = schematic;

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

        const z = Math.floor((index % width) / width);
        const x = (index % width) % width;

        index++;

        const biome = biomePalette.get(value);
        for (let y = 0; y < height; y++) {
            schematic.setBiome({ x, y, z }, biome);
        }
    }
}

export function loadVersion2(tag: TagMap): Schematic {
    const blocks = tag.get('BlockData') as Buffer;
    const biomes = tag.get('BiomeData') as Buffer;
    const width = (tag.get('Width') as Short).value;
    const height = (tag.get('Height') as Short).value;
    const length = (tag.get('Length') as Short).value;
    const dvTag = tag.get('DataVersion') as Int;
    const dataVersion = dvTag
        ? (tag.get('DataVersion') as Int).value
        : DEFAULT_DV;
    const metadataTag = tag.get('Metadata') as TagMap;

    const blockPalette = readBlockPalette(tag.get('Palette') as TagMap);
    const biomePalette = readBiomePalette(tag.get('BiomePalette') as TagMap);

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
            version: (tag.get('Version') as Int).value
        }
    });

    readBlockVarintToSchematic(blocks, blockPalette, schematic);
    if (biomes) {
        readBiomeVarintToSchematic(biomes, biomePalette, schematic);
    }

    return schematic;
}
