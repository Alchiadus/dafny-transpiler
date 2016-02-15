export default class Program {

  _name;
  _precondition;
  _programComponents;
  _postcondition;

  constructor(name, precondition, programComponents, postcondition) {
    this._name = name;
    this._precondition = precondition;
    this._programComponents = programComponents;
    this._postcondition = postcondition;
  }

  get name() {
    return this._name;
  }

  get precondition() {
    return this._precondition;
  }

  get programComponents() {
    return this._programComponents;
  }

  get postcondition() {
    return this._postcondition;
  }
}
