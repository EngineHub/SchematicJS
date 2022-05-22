import { Schematic } from './types';
import { Int, TagMap } from 'nbt-ts';
import { loadVersion2, loadVersion3 } from './sponge';
import { SchematicType } from '.';
import { loadStructure } from './structure';

/**
 * Load a schematic given an NBT Tag.
 *
 * @param tag The tag
 * @param type The schematic type, or undefined to auto-detect.
 * @returns A {@link Schematic}.
 */
export function loadSchematic(tag: TagMap, type?: SchematicType): Schematic {
    if (!type) {
        if (tag.get('BlockData') || tag.get('Blocks')) {
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
                    throw new Error('Unsupported schematic version.');
            }
        }
        case 'structure': {
            return loadStructure(tag);
        }
        default: {
            throw new Error('Unknown schematic format.');
        }
    }
}
