import { CompilerOutput } from "./storyscript/types";

interface Compiler {
    compile(source: string): Promise<CompilerOutput>
}

class Runtime {

    private compiler: Compiler

    constructor(compiler: Compiler) {
        this.compiler = compiler;
    }

    public async deploy(source: string) {
        const story = await this.compiler.compile(source);
        console.log(story)
    }
}

export { Runtime }