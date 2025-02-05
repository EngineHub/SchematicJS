import type { TagMap } from '@enginehub/nbt-ts';
import { Byte, Short } from '@enginehub/nbt-ts';
import { tagToRecord } from './nbt';
import { describe, it, expect } from 'vitest';

describe('tagToRecord', () => {
    it('should convert primitives', () => {
        const tag = new Map<string, unknown>([
            ['byte', new Byte(1)],
            ['short', new Short(2)],
            ['string', 'string']
        ]) as TagMap;

        expect(tagToRecord(tag)).toMatchSnapshot();
    });

    it('should convert arrays', () => {
        const tag = new Map<string, unknown>([
            ['byte', [new Byte(1), new Byte(2)]],
            ['short', [1, 2, 3]],
            ['string', ['string', 'string2']]
        ]) as TagMap;

        expect(tagToRecord(tag)).toMatchSnapshot();
    });

    it('should convert objects', () => {
        const tag = new Map<string, unknown>([
            ['byte', { a: new Byte(1), b: new Byte(2) }],
            ['string', { a: 'string', b: 'string2' }]
        ]) as TagMap;

        expect(tagToRecord(tag)).toMatchSnapshot();
    });
});
