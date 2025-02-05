import { make3DArray } from '../util/array.js';

interface SchematicOptions {
    width: number;
    height: number;
    length: number;
    blockTypes: Block[];
    biomeTypes?: Biome[];
    dataVersion?: number;
    metadata?: Record<string, unknown>;
    format: {
        type: SchematicType;
        version?: number;
    };
}

export class Schematic implements Iterable<BlockVector3> {
    width: number;
    height: number;
    length: number;
    blocks: Block[][][];
    blockTypes: Block[];
    biomes?: Biome[][][];
    biomeTypes: Biome[];
    dataVersion?: number;
    metadata: Record<string, unknown>;
    format: {
        type: SchematicType;
        version?: number;
    };

    constructor({
        width,
        height,
        length,
        blockTypes,
        biomeTypes = [],
        dataVersion,
        metadata = {},
        format
    }: SchematicOptions) {
        this.width = width;
        this.height = height;
        this.length = length;
        this.blockTypes = blockTypes;
        this.biomeTypes = biomeTypes;
        this.dataVersion = dataVersion;
        this.metadata = metadata;
        this.format = format;

        this.blocks = make3DArray(width, height, length);
        this.biomes =
            this.biomeTypes.length === 0
                ? undefined
                : make3DArray(width, height, length);
    }

    contains(pos: BlockVector3): boolean {
        return (
            pos.x < this.width &&
            pos.y < this.height &&
            pos.z < this.length &&
            pos.x >= 0 &&
            pos.y >= 0 &&
            pos.z >= 0
        );
    }

    getBlock(pos: BlockVector3): Block | undefined {
        if (!this.contains(pos)) {
            return undefined;
        }
        return this.blocks[pos.x][pos.y][pos.z];
    }

    setBlock(pos: BlockVector3, block: Block): void {
        if (!this.contains(pos)) {
            return;
        }
        this.blocks[pos.x][pos.y][pos.z] = block;
    }

    getBiome(pos: BlockVector3): Biome | undefined {
        if (!this.contains(pos) || !this.biomes) {
            return undefined;
        }
        return this.biomes[pos.x][pos.y][pos.z];
    }

    setBiome(pos: BlockVector3, biome: Biome): void {
        if (!this.contains(pos) || !this.biomes) {
            return;
        }
        this.biomes[pos.x][pos.y][pos.z] = biome;
    }

    [Symbol.iterator](): Iterator<BlockVector3> {
        let nextX = 0;
        let nextY = 0;
        let nextZ = 0;

        return {
            next: function () {
                if (nextX === -1) {
                    return { done: true };
                }
                const answer = { x: nextX, y: nextY, z: nextZ };
                if (++nextX > this.width - 1) {
                    nextX = 0;
                    if (++nextZ > this.length - 1) {
                        nextZ = 0;
                        if (++nextY > this.height - 1) {
                            nextX = -1;
                        }
                    }
                }
                return { value: answer };
            }.bind(this)
        };
    }
}

export interface BlockVector3 {
    x: number;
    y: number;
    z: number;
}

interface Keyed {
    type: string;
}

export interface Block extends Keyed {
    properties: { [property: string]: string };
}

export type Biome = Keyed;

export type SchematicType = 'sponge' | 'structure' | 'mcedit';
