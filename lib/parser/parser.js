import ParseTree from './parse-tree/parse-tree';
import Program from './parse-tree/program';
import ProgramComponent from './parse-tree/program-component';
import Assertion from './parse-tree/assertion';

/**
 * A (primitive, ad-hoc) parser to parse a piece of Dafny source code.
 *
 * It can extract the following information:
 * - the name of the class defined in the Dafny program
 * - the variables defined in the class
 * - the methods defined in the class
 * - the parallel programs defined in the class
 */
export default class Parser {

  /**
   * Parses a piece of Dafny source code and extracts its properties.
   *
   * @param  {String}    sourceCode the source code to parse
   * @return {ParseTree}            the parse tree
   */
  parse(sourceCode) {
    sourceCode = sourceCode.toString();
    sourceCode = this.preprocess(sourceCode);
    const name = this.extractClassName(sourceCode);
    const includes = this.extractIncludes(sourceCode);
    const variables = this.extractVariables(sourceCode);
    const program = this.extractProgram(sourceCode);
    return new ParseTree(name, includes, variables, program);
  }

  /**
   * Preprocesses a piece of Dafny source code.
   *
   * Replaces all assertions of the form `#ROG` by its `#QOG` and `#POG` equivalent.
   *
   * @private
   * @param  {String} sourceCode the source code to preprocess
   * @return {String}            the preprocessed source code
   */
  preprocess(sourceCode) {
    return sourceCode.replace(/(^\s*)assert(.*?)\/\/\s*#ROG$/gm, (match, p1, p2) => {
      const assert = `${p1}assert${p2}`;
      return `${assert}// #QOG\n${assert}// #POG`;
    });
  }

  /**
   * Extracts the class name from a piece of Dafny source code.
   *
   * Assumes there is only a single class defined.
   * If there are more, only the first class name will be returned.
   *
   * @private
   * @param  {String} sourceCode the source code to extract the class name from
   * @return {String}            the class name
   */
  extractClassName(sourceCode) {
    return /class (.*)/g.exec(sourceCode)[1];
  }

  /**
   * Extracts the include statements from a piece of Dafny source code.
   *
   * @private
   * @param {String}         sourceCode the source code to extract the include statements from
   * @return {Array<String>}            an array containing the include statements
   */
  extractIncludes(sourceCode) {
    return this.execAll(/include\s*"(\S*)"/g, sourceCode);
  }

  /**
   * Extracts the variables from a piece of Dafny source code.
   *
   * Assumes there is only a single class defined.
   * If there are more, only the variables from the first class are returned.
   *
   * @private
   * @param {String}         sourceCode the source code to extract the variables from
   * @return {Array<String>}            an array containing the variables
   */
  extractVariables(sourceCode) {
    const snippet = /class[\s\S]*?{([\s\S]*?)method/g.exec(sourceCode)[1];
    return this.execAll(/\s*(var .*);\n/g, snippet);
  }

  /**
   * Extracts the program from a piece of Dafny source code.
   *
   * Assumes the `main` method is defined before the program component methods.
   *
   * @private
   * @param  {String} sourceCode the source code to extract the programs from
   * @return {Program}           the program
   */
  extractProgram(sourceCode) {
    // TODO: allow methods with parameters to be captured
    const methodNames = this.execAll(/method (\S*)\(\)/g, sourceCode);
    let programName;
    let programComponentNames;
    let programPrecondition;
    let programComponents = [];
    let programPostcondition;
    for (let methodName of methodNames) {
      const methodBodySourceCode = this.extractMethodBody(methodName, sourceCode);
      let methodBody = this.extractSourceCodeLines(methodBodySourceCode);
      let methodAssertions = [];
      let methodAssertionsRegExp = /^\s*assert([\s\S]*?)\/\/\s*#POG$\n([\s\S]*?)\n^\s*assert([\s\S]*?)\/\/\s*#QOG$/gm;
      let match;
      while ((match = methodAssertionsRegExp.exec(methodBodySourceCode)) !== null) {
        if (match.index === methodAssertionsRegExp.lastIndex) {
          methodAssertionsRegExp.lastIndex++;
        }
        let statements = this.extractSourceCodeLines(match[2]);
        methodAssertions.push(new Assertion(methodName, match[1].trim(), statements, match[3].trim()));
      }
      const programComponentBodies = /\/\/ #parallel([\s\S]*?)\/\/ #endparallel/g.exec(methodBodySourceCode);
      if (programComponentBodies) {
        programName = methodName;
        programComponentNames = programComponentBodies[1].replace(/\s/g, '').split(/\(\);/g);
        programComponentNames.splice(-1, 1);
        let assertion = methodAssertions[0];
        programPrecondition = assertion.precondition;
        programPostcondition = assertion.postcondition;
      } else if (programComponentNames.indexOf(methodName) !== -1) {
        programComponents.push(new ProgramComponent(methodName, methodBody, methodAssertions));
      }
    }
    return new Program(programName, programPrecondition, programComponents, programPostcondition);
  }

  /**
   * Extracts given the method name the method body from a piece of Dafny source code.
   *
   * @private
   * @param  {String} methodName the method name to extract the method body from
   * @param  {String} sourceCode the source code to extract the method body from
   * @return {String}            the method body
   */
  extractMethodBody(methodName, sourceCode) {
    return new RegExp(`method ${methodName}\\(\\)\\s*{([\\s\\S]*?)} \\/\\/ #endmethod ${methodName}`, 'g').exec(sourceCode)[1];
  }

  /**
   * Extracts the separate lines from a piece of Dafny source code.
   *
   * Empty lines (lines containing only whitespace) are removed, and lines are trimmed,
   * such that whitespace at the start and end of each line is removed.
   *
   * @private
   * @param  {String}        sourceCode the source code to extract the lines from
   * @return {Array<String>}            an array containing the lines
   */
  extractSourceCodeLines(sourceCode) {
    let sourceCodeLines = sourceCode.split(/\n/g);
    for (let i = sourceCodeLines.length; i--;) {
      if (/^\s*$/.test(sourceCodeLines[i])) {
        sourceCodeLines.splice(i, 1);
      } else {
        sourceCodeLines[i] = sourceCodeLines[i].trim();
      }
    }
    return sourceCodeLines;
  }

  /**
   * Repeatingly executes a regular expression on a string until no more matches are found.
   *
   * Note: will loop indefinitely unless the global flag is set on the regular expression
   *
   * @private
   * @param  {RegExp}        regex  the regular expression object to repeatingly execute
   * @param  {String}        string the string to execute the regular expression on
   * @return {Array<String>}        an array containing the matches
   */
  execAll(regex, string) {
    const result = [];
    let match;
    while ((match = regex.exec(string)) !== null) {
      result.push(match[1]);
    }
    return result;
  }
}
