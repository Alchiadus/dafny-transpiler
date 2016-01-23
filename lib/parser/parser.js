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
   * Returns a parse tree, an object with the following properties:
   * - {String}              className        the class name
   * - {Array<String>}       classVariables   an array containing the variables
   * - {Map<String, Object>} methods          a map that links all method names to an object with their properties
   * - {Array<Object>}       parallelPrograms an array containing the parralel programs
   *
   * @param  {String} sourceCode the source code to parse
   * @return {Object}            an object containing the parse tree
   */
  parse(sourceCode) {
    const parseTree = {};
    parseTree.className = this.extractClassName(sourceCode);
    parseTree.classVariables = this.extractVariables(sourceCode);
    parseTree.methods = this.extractMethods(sourceCode);
    parseTree.parallelPrograms = this.extractParallelPrograms(parseTree.methods);
    return parseTree;
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
   * Extracts the methods from a piece of Dafny source code.
   *
   * Assumes there is only a single class defined.
   * If there are more, all methods from all classes are returned.
   *
   * A method is an object with the following properties:
   * - {String}        name           the name of the method
   * - {Array<String>} preconditions  an array containing the preconditions of the method
   * - {Array<String>} postconditions an array containing the postconditions of the method
   * - {Array<String>} statements     an array containing the statements of the method
   *
   * @private
   * @param  {String}              sourceCode the source code to extract the methods from
   * @return {Map<String, Object>}            a map that links all method names to an object with their properties
   */
  extractMethods(sourceCode) {
    const methodRegEx = /\s*method (\S*)\(\)([\s\S]*?){([\s\S]*?)}/g;
    const methods = new Map();
    let match;
    while ((match = methodRegEx.exec(sourceCode)) !== null) {
      const method = {};
      method.name = match[1];
      method.preconditions = this.extractPreconditions(match[2]);
      method.postconditions = this.extractPostconditions(match[2]);
      method.statements = this.extractStatements(match[3]);
      methods.set(method.name, method);
    }
    return methods;
  }

  /**
   * Extracts all preconditions from a snippet of Dafny source code.
   *
   * @private
   * @param  {String}        snippet the snippet to extract the preconditions from
   * @return {Array<String>}         an array containing the preconditions
   */
  extractPreconditions(snippet) {
    return this.execAll(/requires (.*);\n/g, snippet);
  }

  /**
   * Extracts all postconditions from a snippet of Dafny source code.
   *
   * @private
   * @param  {String}        snippet the snippet to extract the postconditions from
   * @return {Array<String>}         an array containing the postconditions
   */
  extractPostconditions(snippet) {
    return this.execAll(/ensures (.*);\n/g, snippet);
  }

  /**
   * Extracts all statements from a snippet of Dafny source code.
   *
   * @private
   * @param  {String}        snippet the snippet to extract the statements from
   * @return {Array<String>}         an array containing the statements
   */
  extractStatements(snippet) {
    return this.execAll(/\s*(.*?);?\n/g, snippet);
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

  /**
   * Extracts all parallel programs from a map that links all method names to an object with their properties.
   *
   * Assumes a parallel program is defined in one method, that contains the following statements in its body:
   * // #parallel
   * // #endparallel
   * The former to denote the start of a list of parallel program components.
   * The latter to denote the end of a list of parallel program components.
   * Parallel program components are assumed to be method calls.
   *
   * A parallel program is an object with the following properties:
   * - {String}        programName           the name of the parallel program
   * - {Array<String>} programComponentNames an array containing the names of the parallel program components
   *
   * @private
   * @param  {Map<String, Object>} methods the map to extract the parallel programs from
   * @return {Array<Object>}               an array containing the parralel programs
   */
  extractParallelPrograms(methods) {
    const parallelPrograms = [];
    for (let method of methods.values()) {
      const start = method.statements.indexOf('// #parallel');
      const end = method.statements.indexOf('// #endparallel');
      if (start !== -1 && end !== -1) {
        const programName = method.name;
        const programComponentNames = [];
        const statements = method.statements.slice();
        statements.slice(start + 1, end).forEach((statement) => {
          const programComponentName = /(.*)\(\)/g.exec(statement)[1];
          programComponentNames.push(programComponentName);
        });
        parallelPrograms.push({
          programName,
          programComponentNames
        });
      }
    }
    return parallelPrograms;
  }
}
