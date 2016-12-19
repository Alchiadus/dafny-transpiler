Dafny Transpiler
================

A source-to-source compiler (transpiler) for Dafny.

[Dafny](https://dafny.codeplex.com/) is an automatic program verifier for functional correctness. This transpiler adds experimental support for parallel program verification to Dafny. It uses the Owicki-Gries Method of Axiomatic Verification, as described in Chapter 8 of Verification of Sequential and Concurrent Programs [1], to verify parallel programs with shared variables.

## Writing a Parallel Program

The transpiler takes syntactically correct annotated Dafny code as input and produces verifiable Dafny code as output. It assumes a parallel program written as follows:

- a `class` that encompasses the parallel program
- zero or more `instance variables` used by the parallel program components
- one `method`, typically called `Main`, to describe the parallel program, with the following properties:
  - a `// #parallel` annotation to start the list of parallel program components
  - two or more `method` calls corresponding to the parallel program components
  - an `// #endparallel` annotation to end the list of parallel program components
- two or more `methods` that describe the parallel program components listed in the `Main` method. Each statement (or multiple statements, if they are atomic), is surrounded with `assertions`:
  - the first `assertion`, the precondition of the statement, is annotated by appending `// #POG`
  - the second `assertion`, the postcondition of the statement, is annotated by appending `// #QOG`
  - optionally, to avoid duplicating the `// #QOG` and `// #POG` assertions, the `// #ROG` annotation can be used to annotate `assertions` between sequential non-atomic statements

To help the parser with correctly identifying methods, each method is closed by annotating the line with the closing curly bracket with `// #endmethod MethodName`.

Several examples can be found in the `examples/` directory.

## Transpiling a Parallel Program

### Requirements

Dafny Transpiler is written in JavaScript (ES6). The instructions below assume [Node.js](https://nodejs.org/) is installed.

### Development Installation

```bash
# change directory to dafny-transpiler's folder
$ cd dafny-transpiler
# install all dependencies
$ npm install
# build and bundle the transpiler into a single file (dist/dafny-transpiler.js)
$ npm run build
# transpile an example file
$ ./dist/dafny-transpiler.js examples/example-1.dfy
# recommended, but optional: make dafny-transpiler available globally
$ npm link
# the 'dafny-transpiler' command now be used from within any folder
$ dafny-transpiler examples/example-1.dfy
```

### Distribution

Once built, the `dist/dafny-transpiler.js` file is fully self-contained, i.e. it contains all dependencies. To use the Dafny Transpiler, only this file and an installation of Node.js are needed.

### Usage

```bash
$ dafny-transpiler --help

  Usage: dafny-transpiler [options] [command] <inputfile> [outputfile]


  Commands:

    transpile <inputfile> [outputfile]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

  If no option or command is given, transpile is used by default.

  Examples:

    $ dafny-transpiler inputfile.dfy
    $ dafny-transpiler inputfile.dfy outputfile.dfy
```

## References

[1] Apt, Krzysztof R., Frank S. De Boer, and Ernst-Rüdiger Olderog. *Verification of Sequential and Concurrent Programs.* Springer Science & Business Media, 2010.
