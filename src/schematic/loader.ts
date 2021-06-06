import { Schematic } from './types';
import { Int, Tag } from 'nbt-ts';
import { loadVersion2, loadVersion3 } from './sponge';

export function loadSchematic(tag: Tag): Schematic {
    const version = ((tag as any).get('Version') as Int).value;

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
