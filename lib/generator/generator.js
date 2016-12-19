'use babel';

/**
 * A generator to generate a piece of transpiled Dafny source code.
 */
export default class Generator {

  settings = {
    tab: '  ',
    newline: '\n'
  };

  /**
   * Generates a piece of transpiled Dafny source code.
   *
   * @param  {Object} parseTree the parse tree to generate source code for
   * @return {String}           the transpiled source code
   */
  generate(parseTree) {
    let code = '';
    for (let include of parseTree.includes) {
      code += `include "${include}"${this.newline()}`;
    }
    if (code !== '') {
      code += this.newline();
    }
    code += `class ${parseTree.name}${this.newline()}`;
    code += `{${this.newline()}`;
    for (let variable of parseTree.variables) {
      code += `${this.tab()}${variable};${this.newline()}`;
    }
    code += this.generateCorrectnessMethods(parseTree);
    code += `}${this.newline()}`;
    return code;
  }

  /**
   * Generates source code for the local and global correctness methods.
   *
   * @private
   * @param  {Object} parseTree the parse tree to generate source code for
   * @return {String}           a string containing the generated source code
   */
  generateCorrectnessMethods(parseTree) {
    let code = '';
    const program = parseTree.program;
    const programComponents = program.programComponents;
    code += this.generateInitializationCorrectnessMethod(program, programComponents);
    code += this.generateLocalCorrectnessMethods(programComponents);
    code += this.generateFinalizationCorrectnessMethod(program, programComponents);
    code += this.generateGlobalCorrectnessMethods(program, programComponents);
    return code;
  }

  /**
   * Generates source code for the initialization correctness method.
   *
   * @private
   * @param  {Object}         program           the parallel program
   * @param  {Array<Object>}  programComponents the parallel program components
   * @return {String}                           a string containing the generated source code
   */
  generateInitializationCorrectnessMethod(program, programComponents) {
    let code = `${this.newline()}${this.tab()}// Initialization${this.newline(2)}`;
    const initializationCorrectnessMethod = {};
    initializationCorrectnessMethod.name = 'InitializationCorrectness';
    initializationCorrectnessMethod.preconditions = [program.precondition];
    initializationCorrectnessMethod.postconditions = [];
    for (let programComponent of programComponents) {
      initializationCorrectnessMethod.postconditions.push(programComponent.precondition);
    }
    initializationCorrectnessMethod.statements = [];
    code += this.generateMethod(initializationCorrectnessMethod);
    return code;
  }

  /**
   * Generates source code for the local correctness methods.
   *
   * @private
   * @param  {Array<Object>}  programComponents the parallel program components
   * @return {String}                           a string containing the generated source code
   */
  generateLocalCorrectnessMethods(programComponents) {
    let code = `${this.newline()}${this.tab()}// Local Correctness${this.newline(2)}`;
    for (let programComponent of programComponents) {
      code += this.generateLocalCorrectnessMethod(programComponent);
    }
    return code;
  }

  /**
   * Generates source code for a local correctness method.
   *
   * @private
   * @param  {Object}         programComponents the parallel program component
   * @return {String}                           a string containing the generated source code
   */
  generateLocalCorrectnessMethod(programComponent) {
    const localCorrectnessMethod = {};
    localCorrectnessMethod.name = `LocalCorrectness${programComponent.name}`;
    localCorrectnessMethod.preconditions = [programComponent.precondition];
    localCorrectnessMethod.postconditions = [programComponent.postcondition];
    localCorrectnessMethod.statements = programComponent.body;
    let code = this.generateMethod(localCorrectnessMethod);
    code += this.newline();
    return code;
  }

  /**
   * Generates source code for the finalization correctness method.
   *
   * @private
   * @param  {Object}         program           the parallel program
   * @param  {Array<Object>}  programComponents the parallel program components
   * @return {String}                           a string containing the generated source code
   */
  generateFinalizationCorrectnessMethod(program, programComponents) {
    let code = `${this.tab()}// Finalization${this.newline(2)}`;
    const finalizationCorrectnessMethod = {};
    finalizationCorrectnessMethod.name = 'FinalizationCorrectness';
    finalizationCorrectnessMethod.preconditions = [];
    for (let programComponent of programComponents) {
      finalizationCorrectnessMethod.preconditions.push(programComponent.postcondition);
    }
    finalizationCorrectnessMethod.postconditions = [program.postcondition];
    finalizationCorrectnessMethod.statements = [];
    code += this.generateMethod(finalizationCorrectnessMethod);
    return code;
  }

  /**
   * Generates source code for the global correctness methods.
   *
   * @private
   * @param  {Object}         program           the parallel program
   * @param  {Array<Object>}  programComponents the parallel program components
   * @return {String}                           a string containing the generated source code
   */
  generateGlobalCorrectnessMethods(program, programComponents) {
    let code = `${this.newline()}${this.tab()}// Global Correctness${this.newline(2)}`;
    let counter = 0;
    for (let programComponent1 of programComponents) {
      for (let programComponent2 of programComponents) {
        if (programComponent1 !== programComponent2) {
          const {
            _code,
            _counter
          } = this.generateGlobalCorrectnessMethod(programComponent1, programComponent2, counter);
          code += _code;
          counter = _counter;
        }
      }
    }
    code = code.slice(0, -this.settings.newline.length);
    return code;
  }

  /**
   * Generates source code for a global correctness method.
   *
   * @private
   * @param  {Object} programComponent1 the first program component
   * @param  {Object} programComponent2 the second program component
   * @param  {Number} counter           the current counter of the method
   * @return {String}                   a string containing the generated source code
   */
  generateGlobalCorrectnessMethod(programComponent1, programComponent2, counter) {
    let code = '';
    for (let assertion1 of programComponent1.assertions) {
      for (let assertion2 of programComponent2.assertions) {
        for (let assertion of [assertion2.precondition, assertion2.postcondition]) {
          code += `${this.tab()}// R: ${programComponent1.name} --- S: ${programComponent2.name}${this.newline()}`;
          const globalCorrectnessMethodPrecondition = {};
          globalCorrectnessMethodPrecondition.name = `GlobalCorrectness${++counter}`;
          globalCorrectnessMethodPrecondition.preconditions = [assertion];
          globalCorrectnessMethodPrecondition.preconditions.push(assertion1.precondition);
          globalCorrectnessMethodPrecondition.postconditions = [assertion];
          globalCorrectnessMethodPrecondition.statements = assertion1.statements;
          code += this.generateMethod(globalCorrectnessMethodPrecondition);
          code += this.newline();
        }
      }
    }
    return {
      _code: code,
      _counter: counter
    };
  }

  /**
   * Generates source code for a method.
   *
   * @private
   * @param  {Object} method the method
   * @return {String}        a string containing the generated source code
   */
  generateMethod(method) {
    let code = this.tab();
    code += `method ${method.name}()${this.newline()}`;
    if (method.statements.length > 0) {
      code += `${this.tab(2)}modifies this;${this.newline()}`;
    }
    for (let precondition of method.preconditions) {
      code += `${this.tab(2)}requires ${precondition}${this.newline()}`;
    }
    for (let postcondition of method.postconditions) {
      code += `${this.tab(2)}ensures ${postcondition}${this.newline()}`;
    }
    code += `${this.tab()}{${this.newline()}`;
    if (method.statements.length > 0) {
      for (let statement of method.statements) {
        code += `${this.tab(2)}${statement}${this.newline()}`;
      }
    }
    code += `${this.tab()}}${this.newline()}`;
    return code;
  }

  /**
   * Returns a specified number of tabs. Default: 1
   *
   * @private
   * @param  {Number} [numTabs = 1] the number of tabs to return
   * @return {String}               a string containing the number of tabs
   */
  tab(numTabs = 1) {
    let tabs = '';
    for (let i = 0; i < numTabs; i++) {
      tabs += this.settings.tab;
    }
    return tabs;
  }

  /**
   * Returns a specified number of newlines. Default: 1
   *
   * @private
   * @param  {Number} [numTabs = 1] the number of newlines to return
   * @return {String}               a string containing the number of newlines
   */
  newline(numNewLines = 1) {
    let newlines = '';
    for (let i = 0; i < numNewLines; i++) {
      newlines += this.settings.newline;
    }
    return newlines;
  }
}
