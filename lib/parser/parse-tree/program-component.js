'use babel';

export default class ProgramComponent {

  _name;
  _annotations;
  _body;
  _assertions;

  constructor(name, annotations, body, assertions) {
    this._name = name;
    this._annotations = annotations;
    this._body = body;
    this._assertions = assertions;
  }

  get name() {
    return this._name;
  }

  get annotations() {
    return this._annotations;
  }

  get precondition() {
    return this._assertions[0].precondition;
  }

  get assertions() {
    return this._assertions;
  }

  get body() {
    return this._body;
  }

  get postcondition() {
    return this._assertions[this._assertions.length - 1].postcondition;
  }
}
