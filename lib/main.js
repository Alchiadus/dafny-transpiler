import fs from 'fs';
import path from 'path';

import DafnyTranspiler from 'commander';

import Parser from './parser/parser';
import Generator from './generator/generator.js';

DafnyTranspiler
  .version('0.0.0');

DafnyTranspiler
  .command('transpile <inputfile> [outputfile]')
  .action((inputfile, outputfile) => {
    transpileFile(inputfile, outputfile);
  });

DafnyTranspiler
  .arguments('<inputfile> [outputfile]')
  .action((inputfile, outputfile) => {
    transpileFile(inputfile, outputfile);
  });

DafnyTranspiler
  .on('--help', () => {
    /* eslint-disable no-console, lines-around-comment */
    console.log('  If no option or command is given, transpile is used by default.');
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    $ dafny-transpiler inputfile.dfy');
    console.log('    $ dafny-transpiler inputfile.dfy outputfile.dfy');
    console.log('');
    /* eslint-enable no-console, lines-around-comment */
  });

DafnyTranspiler.parse(process.argv);

if (!DafnyTranspiler.args.length) {
  DafnyTranspiler.help();
}

/**
 * Transpiles a file containing Dafny source code.
 *
 * @param  {String} inputFile  the path of the file that needs to be transpiled
 * @param  {String} outputFile the path of the file that has been transpiled
 */
function transpileFile(inputFile, outputFile) {
  if (!outputFile) {
    const fileExtension = path.extname(inputFile);
    const fileNameSuffix = '-transpiled';
    const fileName = path.basename(inputFile, fileExtension);
    const fileNamePrefix = '';
    const filePath = path.dirname(inputFile);
    outputFile = path.join(filePath, `${fileNamePrefix}${fileName}${fileNameSuffix}${fileExtension}`);
  }
  const sourceCode = fs.readFileSync(inputFile);
  const transpiledSourceCode = transpile(sourceCode);
  fs.writeFileSync(outputFile, transpiledSourceCode);
}

/**
 * Transpiles a piece of Dafny source code.
 *
 * @param  {String} sourceCode the Dafny source code that needs to be transpiled
 * @return {String}            the Dafny source code that has been transpiled
 */
function transpile(sourceCode) {
  const parser = new Parser();
  const parseTree = parser.parse(sourceCode);
  const generator = new Generator();
  const transpiledSourceCode = generator.generate(parseTree);
  return transpiledSourceCode;
}
