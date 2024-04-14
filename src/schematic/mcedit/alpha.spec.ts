import fs from 'fs';
import type { TagMap } from '@enginehub/nbt-ts';
import { decode } from '@enginehub/nbt-ts';
import { loadMCEditAlpha } from './alpha';
import { unzip } from 'gzip-js';

function parseNbt(nbt: Uint8Array): TagMap {
    const deflated = unzip(nbt);
    const data = decode(Buffer.from(deflated), {
        unnamed: false,
        useMaps: true
    });
    return data.value as TagMap;
}

describe('loadMCEditAlpha', () => {
    it('should load a MCEdit Alpha schematic', () => {
        const loadedFile = new Uint8Array(
            fs.readFileSync('./src/test-files/mcedit_alpha.schematic')
        );
        const schematic = loadMCEditAlpha(parseNbt(loadedFile));
        expect(schematic).toMatchSnapshot();
    });
});
