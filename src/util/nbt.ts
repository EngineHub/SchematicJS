import {
    Byte,
    Float,
    getTagType,
    Int,
    Short,
    TagArray,
    TagMap,
    TagObject,
    TagType
} from 'nbt-ts';

export function normaliseCompoundToObject(tag: TagObject | TagMap): TagObject {
    if (tag instanceof Map) {
        tag = Object.fromEntries(tag);
    }

    return tag;
}

export function normaliseCompoundToMap(tag: TagObject | TagMap): TagMap {
    if (tag.constructor === Object) {
        tag = new Map(Object.entries(tag)) as TagMap;
    }

    return tag as TagMap;
}

export function tagToRecord(tag: TagObject | TagMap): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};

    const tagObj = normaliseCompoundToObject(tag);

    Object.keys(tagObj).forEach(key => {
        const value = tagObj[key];
        switch (getTagType(value)) {
            case TagType.Byte:
            case TagType.Short:
            case TagType.Int:
            case TagType.Float:
                metadata[key] = (value as Byte | Short | Int | Float).value;
                break;
            case TagType.Long:
            case TagType.Double:
            case TagType.String:
            case TagType.ByteArray:
            case TagType.IntArray:
            case TagType.LongArray:
                metadata[key] = value;
                break;
            case TagType.Compound:
                metadata[key] = tagToRecord(value as TagMap | TagObject);
                break;
            case TagType.List:
                metadata[key] = tagToArray(value as TagArray);
                break;
            default:
                throw new Error(`Unknown tag type: ${getTagType(value)}`);
        }
    });

    return metadata;
}

export function tagToArray(tag: TagArray): unknown[] {
    const array: unknown[] = [];

    tag.forEach((value, index) => {
        switch (getTagType(value)) {
            case TagType.Byte:
            case TagType.Short:
            case TagType.Int:
            case TagType.Float:
                array[index] = (value as Byte | Short | Int | Float).value;
                break;
            case TagType.Long:
            case TagType.Double:
            case TagType.String:
            case TagType.ByteArray:
            case TagType.IntArray:
            case TagType.LongArray:
                array[index] = value;
                break;
            case TagType.Compound:
                array[index] = tagToRecord(value as TagMap);
                break;
            case TagType.List:
                array[index] = tagToArray(value as TagArray);
                break;
            default:
                throw new Error(`Unknown tag type: ${getTagType(value)}`);
        }
    });

    return array;
}
