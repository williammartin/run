import assert = require('assert');
import { isNil, reduce } from 'lodash';

import { App } from '../../app';
import { CompilerLine, StoryLineObject, StoryLineObjectTypes } from '../types';
import objectEval from './objectEval';
import { StoryContext, StoryServiceValue, StoryVar } from './types';

// import logger from "@logger";

/**
 * Main executor for Storyscript code.
 */
class Executor {

  constructor(private app: App) { }

  body(line: string): CompilerLine {
    return this.app.story.tree[line];
  }

  /**
   * Run the initialization code of a story.
   */
  async run(): Promise<void> {
    await this.exec(this.app.story.entrypoint);
    // TODO: freeze globals as constants
  }

  /*
   * Run a story from a specific line.
   */
  async exec(line: string): Promise<void> {
    const body = this.body(line);

    await ExecutorFactory.from(body.method).exec(this.app, body);

    // do not step into when blocks
    if (body.enter && body.method !== "when") {
      await this.execBlock(body);
    } else {
      await this.execNext(line);
    }
  }

  async execNext(line: string): Promise<void> {
    const body = this.body(line);

    if (!isNil(body.next)) {
      await this.exec(body.next!);
    }
  }

  async execBlock(line: CompilerLine): Promise<void> {
    assert(!isNil(line.enter));

    await this.app.context.withFrame(async () => {
      await this.exec(line.enter!);
    });

    // jump to the next block if there is one
    if (!isNil(line.exit)) {
      await this.exec(line.exit!);
    }
  }
}

/**
 * Convert raw story objects to a map of arguments.
 */
function toCallArgs(
  context: StoryContext,
  args: StoryLineObject[]
): {
  [argName: string]: any /*eslint-disable-line @typescript-eslint/no-explicit-any */;
} {
  return reduce(
    args,
    (
      callArgs: {
        [argName: string]: any /*eslint-disable-line @typescript-eslint/no-explicit-any */;
      },
      arg: StoryLineObject
    ) => {
      assert(arg.$OBJECT === StoryLineObjectTypes.arg);
      callArgs[arg.name!] = objectEval(context, arg.arg!).value();
      return callArgs;
    },
    {}
  );
}

type StoryExecutorFn = (app: App, line: CompilerLine) => Promise<void>;

/**
 * Interface for a StoryExecutor that process an individual line.
 */
export interface IStoryExecutor {
  exec: StoryExecutorFn;
}

class ExecutorFactory {

  public static from(method: string): IStoryExecutor {
    switch (method) {
      case "expression":
        return new AssignmentExecutor();
      case "execute":
        return new ServiceExecutor();
      case "when":
        return new WhenExecutor();
      default:
        return new NotImplementedExecutor();
    }
  }
}

class NotImplementedExecutor implements IStoryExecutor {
  async exec(app: App, line: CompilerLine): Promise<any> {
    return Promise.reject(new Error('Method not implemented'))
  }
}

/**
 * Executors service commands.
 */
class ServiceExecutor implements IStoryExecutor {

  async exec(
    app: App,
    line: CompilerLine,
  ): Promise<any> /*eslint-disable-line @typescript-eslint/no-explicit-any */ {
    // TODO: throw user-error if the service doesn't exist
    const runtimeService = app.services.get(line.service!);

    // services don't need to initialized anymore -> ignore block services
    if (!isNil(line.enter)) {
      const output = line.output![0];
      const serviceValue = new StoryServiceValue(runtimeService!);
      app.context.setVar(output, new StoryVar(output, serviceValue));
      return;
    }

    const args = toCallArgs(app.context, line.args);
    const command = line.command!;
    return await (runtimeService as any) /*eslint-disable-line @typescript-eslint/no-explicit-any */[command].call(this, args);
  }
}

/**
 * Analyzes a `when` block and sets up its event subscription.
 */
class WhenExecutor implements IStoryExecutor {
  async exec(app: App, line: CompilerLine): Promise<void> {
    assert(line.method === "when");
    // TODO: handle non-existing service
    const service = app.context.getVar(line.service!).value.value();
    const command = line.command!;
    const args = toCallArgs(app.context, line.args);
    const output = line.output[0];

    const eventID: string = await app.registerEvent(service.name(), command, args, line.enter!, output);
    await (service as any)[command].call(service, app.id, eventID, args);
  }
}

/**
 * Handles normal expression and performs assignments in the current frame.
 */
class AssignmentExecutor implements IStoryExecutor {
  async exec(app: App, line: CompilerLine): Promise<void> {
    const value = objectEval(app.context, line.args[0]);
    const varName = line.name![0];
    // logger.info("executor.assign: ", { varName, value: value.toString() });
    app.context.setVar(varName, new StoryVar(varName, value));
  }
}

export {
  Executor,
}