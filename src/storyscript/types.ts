/**
 * The main Storyscript compilation output node.
 */
export interface CompilerOutput {
    services: string[];
    entrypoint: string;
    functions: {};
    version: string;
    tree: { [line: string]: CompilerLine };
  }
  
  /**
   * An individual line of a Storyscript compilation.
   * A line can have a rather wide amount of optional fields.
   */
  export interface CompilerLine {
    method: string;
    ln: string;
    col_start?: string;
    col_end?: string;
    output: string[];
    name?: string;
    service?: string;
    command?: string;
    function?: string;
    args: StoryLineObject[];
    enter?: string;
    exit?: string;
    next?: string;
    parent?: string;
    src?: string;
  }
  
  export enum StoryLineObjectTypes {
    string = "string",
    int = "int",
    float = "float",
    list = "list",
    dict = "dict",
    arg = "arg",
    path = "path",
    dot = "dot",
    type = "type",
    expression = "expression",
    typeCast = "type_cast",
  }
  
  export enum StoryExpressionTypes {
    sum = "sum",
  }
  
  export enum StoryType {
    string = "string",
    int = "int",
    float = "float",
  }
  
  export interface StoryTypeObject {
    $OBJECT: string;
    type: StoryType;
  }
  
  // TODO: model this union type correctly
  export interface StoryLineObject {
    $OBJECT: StoryLineObjectTypes;
    string?: string;
    int?: number;
    float?: number;
    regex?: string;
    time?: number;
    name?: string;
    paths?: (string | StoryLineObject)[];
    expression?: StoryExpressionTypes;
    arg?: StoryLineObject;
    args?: StoryLineObject[];
    items?: StoryLineObject[] | StoryLineObject[][];
    value?: StoryLineObject;
    type?: StoryTypeObject;
    values?: StoryLineObject[];
    dot?: string;
  }  