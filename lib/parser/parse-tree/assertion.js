export default class Assertion {

  _name;
  _precondition;
  _statements;
  _postcondition;

  constructor(name, precondition, statements, postcondition) {
    this._name = name;
    this._precondition = precondition;
    this._statements = statements;
    this._postcondition = postcondition;
  }

  get name() {
    return this._name;
  }

  get precondition() {
    return this._precondition;
  }

  get statements() {
    return this._statements;
  }

  get postcondition() {
    return this._postcondition;
  }
}
