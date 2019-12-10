export class Operations {
  constructor(dimensions, options = {}) {
    this.dimensions = dimensions;
    this.operationMap = {};
    this.state;
    this.settings = options.settings;
  }

  mapOperation(dimension, op) {
    this.operationMap[dimension] = op;
  }

  getOperation(dimension, property) {
    if (this.operationMap.hasOwnProperty(dimension)){
      return () => this.operationMap[dimension](property);
    } else {
      throw new Error(`No operation defined for dimension "${dimension}"`);
    }
  }

  * buildOperationSet(testCase) {
    const properties = testCase.trim().split(' ');
    for (let i = 0; i < properties.length; i++) {
      yield this.getOperation(this.dimensions[i], properties[i]);
    }
  }
}