import type { Schematic } from './types.js';
import type { Int, TagMap } from 'nbt-ts';
import { loadVersion2, loadVersion3 } from './sponge/index.js';
import type { SchematicType } from './index.js';
import { loadStructure } from './structure/index.js';
import { loadMCEditAlpha } from './mcedit/index.js';

/**
 * Load a schematic given an NBT Tag.
 *
 * @param tag The tag
 * @param type The schematic type, or undefined to auto-detect.
 * @returns A {@link Schematic}.
 */
export function loadSchematic(tag: TagMap, type?: SchematicType): Schematic {
    if (!type) {
        if (tag.get('Schematic') && tag.size === 1) {
            // Unwrap Sponge version 3 schematics.
            tag = tag.get('Schematic') as TagMap;
        }
        if (tag.get('Materials')) {
            type = 'mcedit';
        } else if (tag.get('BlockData') || tag.get('Blocks')) {
            type = 'sponge';
        } else if (tag.get('blocks')) {
            type = 'structure';
        }
    }

    switch (type) {
        case 'sponge': {
            const version = (tag.get('Version') as Int).value;
            switch (version) {
                case 1:
                case 2:
                    return loadVersion2(tag);
                case 3:
                    return loadVersion3(tag);
                default:
                    throw new Error('Unsupported Sponge schematic version.');
            }
        }
        case 'structure': {
            return loadStructure(tag);
        }
        case 'mcedit': {
            const version = tag.get('Materials') as string;
            switch (version) {
                case 'Alpha':
                    return loadMCEditAlpha(tag);
                default:
                    throw new Error('Unsupported MCEdit schematic version.');
            }
        }
        default: {
            throw new Error('Unsupported schematic format.');
        }
    }
}
