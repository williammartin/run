/**
 * This is a Storyscript compilation PoC.
 * As Storyscript has a moderately high initialization time (~1s), spawning a
 * new process for every compilation is undesirable.
 * For now, this uses `python-bridge` which opens an interactive `python` shell
 * and subscribes to its stdout and sends commands via stdin.
 * In the future, this could be replaced by a more dedicated approach.
 */
import { pythonBridge, PythonBridge } from "python-bridge";
import { CompilerOutput } from "./types";

class Compiler {
  python?: PythonBridge;

  // TODO: this is rather expensive
  async start(): Promise<PythonBridge> {
    if (this.python !== undefined) {
      return this.python;
    }

    process.on("exit", () => {
      this.stop();
    });

    const python = pythonBridge({
      python: "python3.7",
    });
    await python.ex`from storyscript import Api`;
    await python.ex`
    def compile_or_error(val):
        ret = Api.loads(val)
        if ret.success():
            return ret.result().output()
        else:
            error = ret.errors()[0]
            return error.short_message()
`;
    return (this.python = python);
  }

  public async compile(source: string): Promise<CompilerOutput> {
    // TODO: throw proper Storyscript errors
    const python = await this.start();
    const result = await python`compile_or_error(${source})`;
    if (typeof result === "string") {
      throw new Error(result);
    }
    return result;
  }

  public async stop(): Promise<void> {
    await this.python?.end();
    this.python = undefined;
  }
}

export {
  Compiler,
} 