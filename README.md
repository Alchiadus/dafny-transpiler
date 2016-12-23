# Dafny Owicki-Gries Transpiler

A source-to-source transpiler for Dafny.

[Dafny](https://dafny.codeplex.com/) is an automatic program verifier for functional correctness. This transpiler adds extremely experimental support for parallel program verification with Dafny, using the Owicki-Gries method of Axiomatic Verification, as described in Chapter 8 of Verification of Sequential and Concurrent Programs [1], to verify parallel programs with shared variables. The intention is to show a proof of concept and not an environment that supports all the rich Dafny features.

The transpiler takes a _specially commented annotated_ Dafny program and produces a Dafny program that Dafny can verify. A properly annotated and commented correct proof outline yields a Dafny program that is correct if and only if the intended Owicki-Gries is correct.

## Writing a Parallel Program

The transpiler takes syntactically correct annotated Dafny code as input and produces verifiable Dafny code as output. It assumes a parallel program written as follows:

- a `class` that encompasses the parallel program
- zero or more `instance variables` used by the parallel program components
- one `method`, typically called `Main`, to describe the parallel program, with the following properties:
  - one assertion for the precondition, ending with a `// #POG` annotation
  - a `// #parallel` annotation to start the list of parallel program components
  - two or more `method` calls corresponding to the parallel program components
  - an `// #endparallel` annotation to end the list of parallel program components
  - one assertion for the postcondition, ending with a `// #QOG` annotation
- two or more `methods` that describe the parallel program components listed in the `Main` method. Each statement (or multiple statements, if they are atomic), is surrounded with `assertions`:
  - the first `assertion`, the precondition of the statement, is annotated by appending `// #POG`
  - the second `assertion`, the postcondition of the statement, is annotated by appending `// #QOG`
  - optionally, to avoid duplicating the `// #QOG` and `// #POG` assertions, the `// #ROG` annotation can be used to annotate `assertions` between sequential non-atomic statements

To help the parser with correctly identifying methods, each method is closed by annotating the line with the closing curly bracket with `// #endmethod MethodName`.

Several examples can be found in the `examples/` directory.

### Limitations / Rules

The transpiler is intended as a proof of concept and as such, it has (severe) limitations. A possibly incomplete list is given below:

- The transpiler uses a primitive parser made out of regular expressions. It uses heuristics to find the information it needs to generate Owicki-Gries proof obligations.
- The transpiler generates code that Dafny can verify. It does not generate code that is intended to run as a program, verification is its only goal.
- The `Main()` method needs to be defined before the program components it contains.
- the `Main()` method should only contain one parallel block and cannot contain statements before or after that parallel block.
- Program components cannot have parameters in their method declaration.
- Program components should not use `requires` and `ensures` in their method annotations. Instead, they should use assertions.
- Program components can use a `decreases *;` in their method annotation when their body is possibly non-terminating. This method annotation will be added to the its local correctness methods, as well as each global correctness method that contains a statement of the non-terminating method.
- Everything between two assertions should be one (or more) valid Dafny statements. For example, the following will result in invalid Dafny code, because `if (myGuard) {` is not a valid statement:
  ```java
  // ...
  assert 'foo'; // #POG
  if (myGuard) {
    assert 'bar'; // #QOG
  }
  // ...
  ```
- Everything between two assertions is one atomic statement. It is recommended to use Dafny's multi-assignment

_Note: especially important is the last remark in the list. The Owicki-Gries method requires that every atomic statement is surrounded by assertions. Consequently, the transpiler generates Dafny code with Owicki-Gries proof obligations under the assumption that everything between two assertions is meant to be atomic. For example, a loop between two assertions means that the complete loop will be one atomic statement, from start to finish, without any possible interleaving between iterations of the loop._

## Transpiling a Parallel Program

### Requirements

Dafny Transpiler is written in JavaScript (ES6). The instructions below assume [Node.js](https://nodejs.org/) is available in the system's `$PATH` variable. The portable version is sufficient to run the transpiler.

### Download

The latest version of a fully self-contained (except for Node.js) `dafny-transpiler.js` can be found on the [releases](https://github.com/Alchiadus/dafny-transpiler/releases) page. Each release also has an `examples.zip` archive that contains the examples from the `examples/` directory.

### Usage

```bash
# Transpile `example1.dfy` to `example1-transpiled.dfy`.
./dafny-transpiler.js examples/example1.dfy
# Run Dafny on the transpiled file.
dafny example1-transpiled.dfy
```

### Help

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

### Development

```bash
# change directory to dafny-transpiler's folder
$ cd dafny-transpiler
# install all dependencies
$ npm install
# build and bundle the transpiler into a single file (dist/dafny-transpiler.js)
$ npm run build
# transpile an example file
$ ./dist/dafny-transpiler.js examples/example1.dfy
```

#### Distribution

Once built, the `dist/dafny-transpiler.js` file is fully self-contained, i.e. it contains all dependencies. To use the Dafny Transpiler, only this file and an installation of Node.js are needed.

## References

[1] Apt, Krzysztof R., Frank S. De Boer, and Ernst-Rüdiger Olderog. *Verification of Sequential and Concurrent Programs.* Springer Science & Business Media, 2010.
