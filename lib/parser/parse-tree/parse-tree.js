export default class ParseTree {

  _name;
  _includes;
  _variables;
  _program;

  constructor(name, includes, variables, program) {
    this._name = name;
    this._includes = includes;
    this._variables = variables;
    this._program = program;
  }

  get name() {
    return this._name;
  }

  get includes() {
    return this._includes;
  }

  get variables() {
    return this._variables;
  }

  get program() {
    return this._program;
  }
}
