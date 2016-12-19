import DafnyTranspiler from 'commander';

import DafnyOwickiGriesTranspiler from './main';

DafnyTranspiler
  .version('0.0.0');

DafnyTranspiler
  .command('transpile <inputfile> [outputfile]')
  .action((inputfile, outputfile) => {
    DafnyOwickiGriesTranspiler.transpileFile(inputfile, outputfile);
  });

DafnyTranspiler
  .arguments('<inputfile> [outputfile]')
  .action((inputfile, outputfile) => {
    DafnyOwickiGriesTranspiler.transpileFile(inputfile, outputfile);
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
