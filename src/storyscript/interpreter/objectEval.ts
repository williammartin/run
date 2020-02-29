import assert = require("assert");

import { map, reduce } from "lodash";

import { StoryExpressionTypes, StoryType, StoryLineObject, StoryLineObjectTypes } from "../types";
import { StoryValueExecutorFn, StoryContext, StoryValue, StoryStringValue, StoryIntValue, StoryFloatValue, StoryListValue, StoryMapValue } from "./types";


/**
 * Handles `expression` objects (e.g. `sum`)
 */
const expressionEval: StoryValueExecutorFn = (
  context: StoryContext,
  payload: StoryLineObject
): StoryValue => {
  const exprType = payload.expression!;
  const [headItem, ...tailItems] = objectEvalList(context, payload.values!);
  if (exprType === StoryExpressionTypes.sum) {
    return reduce(
      tailItems,
      (item, currentItem) => item.sum(currentItem),
      headItem
    );
  } else {
    throw new Error(`Not implemented: ${exprType}`);
  }
};

/**
 * Handles `path` objects.
 */
const pathEval: StoryValueExecutorFn = (
  context: StoryContext,
  payload: StoryLineObject
): StoryValue => {
  assert(payload.$OBJECT == "path");
  const [pathVar, ...paths] = payload.paths!;
  const storyVar = context.getVar(pathVar as string);
  return reduce(
    paths as StoryLineObject[],
    (v: StoryValue, o: StoryLineObject) => {
      assert(o.$OBJECT === StoryLineObjectTypes.dot);
      return v.dot(o.dot!);
    },
    storyVar.value
  );
};

/**
 * Handles `type_cast` objects.
 */
const typeCastEval: StoryValueExecutorFn = (
  context: StoryContext,
  payload: StoryLineObject
): StoryValue => {
  assert(payload.$OBJECT === "type_cast");
  const value = objectEval(context, payload.value!);
  const cast = payload.type!;
  assert(cast.$OBJECT === "type");
  const castType = cast.type;
  if (castType === StoryType.string) {
    let newVal: string;
    if (value instanceof StoryStringValue) {
      newVal = value.value();
    } else {
      newVal = value.toString();
    }
    return new StoryStringValue(newVal);
  } else {
    throw new Error(`Cast not implemented: ${castType}`);
  }
};

/**
 * Evaluates a StoryLineObject and returns its respective StoryValue.
 */
const objectEval: StoryValueExecutorFn = (
  context: StoryContext,
  payload: StoryLineObject
): StoryValue => {
  const objType = payload.$OBJECT;
  if (objType === StoryLineObjectTypes.expression) {
    return expressionEval(context, payload);
  } else if (objType === StoryLineObjectTypes.path) {
    return pathEval(context, payload);
  } else if (objType === StoryLineObjectTypes.typeCast) {
    return typeCastEval(context, payload);
  } else if (objType === StoryLineObjectTypes.string) {
    return new StoryStringValue(payload.string!);
  } else if (objType === StoryLineObjectTypes.int) {
    return new StoryIntValue(payload.int!);
  } else if (objType === StoryLineObjectTypes.float) {
    return new StoryFloatValue(payload.float!);
  } else if (objType === StoryLineObjectTypes.list) {
    return new StoryListValue(
      objectEvalList(context, payload.items! as StoryLineObject[])
    );
  } else if (objType === StoryLineObjectTypes.dict) {
    return new StoryMapValue(
      reduce(
        payload.items!,
        (map: { [key: string]: StoryValue }, item) => {
          const items = item as StoryLineObject[];
          const key = objectEval(context, items[0] as StoryLineObject)!;
          assert(
            key instanceof StoryStringValue,
            "Only strings are allowed as keys"
          );
          const value = objectEval(context, items[1] as StoryLineObject);
          map[key.string()] = value;
          return map;
        },
        {}
      )
    );
  } else {
    throw new Error(`Not implemented: ${objType}`);
  }
};

/**
 * Evaluate a list of `items` to `StoryValue`s.
 */
function objectEvalList(
  context: StoryContext,
  payload: StoryLineObject[]
): StoryValue[] {
  return map(payload, item => objectEval(context, item as StoryLineObject));
}

export default objectEval;
