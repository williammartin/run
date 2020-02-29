import assert = require("assert");

import {
    isArray,
    isInteger,
    isNumber,
    isObject,
    isString,
    map,
    mapValues,
} from "lodash";

import {
    Discriminator,
    Transform,
    Type,
    plainToClass,
} from "class-transformer";

import "reflect-metadata";
import { StoryLineObject } from "../types";

/**
 * Variable context of a story.
 */
class StoryContext {
    readonly globals: { [varName: string]: StoryVar };
    @Transform(
        value => {
            return map(value, item => {
                return mapValues(item, value => {
                    return plainToClass(StoryVar, value);
                });
            });
        },
        { toClassOnly: true }
    )
    frames: { [varName: string]: StoryVar }[];

    constructor() {
        this.globals = {};
        this.frames = [{}];
    }

    /**
     * Search for a variable in all frames and globals.
     */
    getVar(key: string): StoryVar {
        for (let i = this.frames.length - 1; i >= 0; i--) {
            const frame = this.frames[i];
            if (key in frame) {
                return frame[key];
            }
        }
        if (key in this.globals) {
            return this.globals[key];
        }
        throw new Error("Variable doesn't exist.");
    }

    /**
     * Set variable in the current frame.
     */
    setVar(key: string, value: StoryVar): void {
        this.frames[this.frames.length - 1][key] = value;
    }

    /**
     * Open a new frame and close it with this iterator.
     */
    async withFrame(cb: () => Promise<void>): Promise<void> {
        this.frames.push({});
        await cb();
        this.frames.pop();
    }
}

const storyDiscriminator = (): Discriminator => {
    return {
        property: "__type",
        subTypes: [
            { value: StoryStringValue, name: "string" },
            { value: StoryIntValue, name: "int" },
            { value: StoryFloatValue, name: "float" },
            { value: StoryListValue, name: "list" },
            { value: StoryMapValue, name: "map" },
            //   { value: StoryServiceValue, name: "service" },
        ],
    };
};

/**
 * Base class that all StoryValue classes need to implement.
 * Interaction should be done through dedicated methods (e.g. sum, dot), s.t.
 * new types can be added easily and value manipulation can be checked.
 */
abstract class StoryValue {
    abstract value(): any /*eslint-disable-line @typescript-eslint/no-explicit-any */;
    string(): string {
        assert(this instanceof StoryStringValue);
        return this.value();
    }
    int(): number {
        assert(this instanceof StoryIntValue);
        return this.value();
    }
    map(): {
        [key: string]: any /*eslint-disable-line @typescript-eslint/no-explicit-any */;
    } {
        assert(this instanceof StoryMapValue);
        return this.value();
    }
    list(): any[] /*eslint-disable-line @typescript-eslint/no-explicit-any */ {
        assert(this instanceof StoryListValue);
        return this.value();
    }
    toString(): string {
        return JSON.stringify(this.value());
    }
    toJSON(): object {
        return this.value();
    }
    abstract sum(value: StoryValue): StoryValue;

    dot(key: string): StoryValue {
        throw new Error(`Dot operation ${key} not allowed on ${typeof this}`);
    }
}

class StoryStringValue extends StoryValue {
    constructor(private readonly _value: string) {
        super();
    }
    value(): string {
        return this._value;
    }
    sum(value: StoryValue): StoryValue {
        if (!(value instanceof StoryValue)) {
            throw new Error(`Invalid sum between ${typeof this} and ${typeof value}`);
        }
        let result = this.value();
        if (value instanceof StoryStringValue) {
            result += value.value();
        } else {
            result += value.toString();
        }
        return new StoryStringValue(result);
    }
}

class StoryIntValue extends StoryValue {
    constructor(private readonly _value: number) {
        super();
    }
    value(): number {
        return this._value;
    }

    sum(value: StoryValue): StoryValue {
        if (value instanceof StoryIntValue) {
            return new StoryIntValue(this.value() + value.value());
        } else if (value instanceof StoryFloatValue) {
            return new StoryFloatValue(this.value() + value.value());
        } else {
            throw new Error(`Invalid sum between ${typeof this} and ${typeof value}`);
        }
    }
}

class StoryFloatValue extends StoryValue {
    constructor(private readonly _value: number) {
        super();
    }
    value(): number {
        return this._value;
    }
    sum(value: StoryValue): StoryValue {
        if (!(value instanceof StoryFloatValue || value instanceof StoryIntValue)) {
            throw new Error(`Invalid sum between ${typeof this} and ${typeof value}`);
        }
        return new StoryFloatValue(this.value() + value.value());
    }
}

class StoryListValue extends StoryValue {
    @Type(() => StoryValue, {
        //discriminator: storyDiscriminator(),
    })
    private readonly _value: StoryValue[];
    constructor(value: StoryValue[]) {
        super();
        this._value = value;
    }
    value(): Array<
        any /*eslint-disable-line @typescript-eslint/no-explicit-any */
    > {
        return this._value.map((item: StoryValue) => item.value());
    }

    sum(value: StoryValue): StoryValue {
        throw new Error(`Invalid sum between ${typeof this} and ${typeof value}`);
    }
}

type StoryMapValueFields = { [key: string]: StoryValue };

class StoryMapValue extends StoryValue {
    //@Transform(
    //item => {
    //return mapValues(item, value => {
    //return plainToClass(StoryValue, value);
    //});
    //},
    //{ toClassOnly: true }
    //)
    private readonly _value: StoryMapValueFields;
    constructor(value: StoryMapValueFields) {
        super();
        this._value = value;
    }
    value(): {
        [key: string]: any /*eslint-disable-line @typescript-eslint/no-explicit-any */;
    } {
        return mapValues(this._value, (item: StoryValue) => {
            return item.value();
        });
    }

    sum(value: StoryValue): StoryValue {
        throw new Error(`Invalid sum between ${typeof this} and ${typeof value}`);
    }

    dot(key: string): StoryValue {
        if (!(key in this._value)) {
            throw new Error(`Dot with key=${key} failed`);
        }
        return this._value[key];
    }
}



export class StoryServiceValue extends StoryValue {

    constructor(private readonly _value: string) {
        super();
    }
    value(): string {
        return this._value;
    }
    sum(value: StoryValue): StoryValue {
        if (!(value instanceof StoryValue)) {
            throw new Error(`Invalid sum between ${typeof this} and ${typeof value}`);
        }
        let result = this.value();
        if (value instanceof StoryStringValue) {
            result += value.value();
        } else {
            result += value.toString();
        }
        return new StoryStringValue(result);
    }
    //   @Transform(value => value.serviceName(), { toPlainOnly: true })
    //   private readonly _value: RuntimeService;
    //   constructor(value: RuntimeService) {
    //     super();
    //     this._value = value;
    //   }
    //   value(): RuntimeService {
    //     return this._value;
    //   }

    //   sum(value: StoryValue): StoryValue {
    //     throw new Error(`Invalid sum between ${typeof this} and ${typeof value}`);
}

/***
 * Converts a plain Javascript value into a Storyscript value.
 */
function plainToValue(
    payload: any /*eslint-disable-line @typescript-eslint/no-explicit-any */
): StoryValue {
    if (isString(payload)) {
        return new StoryStringValue(payload);
    } else if (isInteger(payload)) {
        return new StoryIntValue(payload);
    } else if (isNumber(payload)) {
        return new StoryFloatValue(payload);
    } else if (isNumber(payload)) {
        return new StoryFloatValue(payload);
    } else if (isArray(payload)) {
        return new StoryListValue(map(payload, item => plainToValue(item)));
    } else if (isObject(payload)) {
        return new StoryMapValue(
            mapValues(payload as StoryMapValueFields, item => plainToValue(item))
        );
    }
    throw new Error(`Unknown value: ${payload}`);
}

/**
 * A Storyscript variable consists of a name and a value.
 */
class StoryVar {
    @Type(() => StoryValue, {
        discriminator: storyDiscriminator(),
    })
    public readonly value: StoryValue;
    constructor(public readonly name: string, value: StoryValue) {
        this.value = value;
    }
}

export {
    StoryValue,
    StoryIntValue,
    StoryFloatValue,
    StoryMapValue,
    StoryListValue,
    StoryStringValue,
    StoryContext,
    StoryVar,
    plainToValue,
}


export type StoryValueExecutorFn = (
    context: StoryContext,
    line: StoryLineObject
) => StoryValue;

