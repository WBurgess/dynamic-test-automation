export class Operations {
  constructor(dimensions, options = {}) {
    this.dimensions = dimensions;
    this.init = options.init || null;
    this.teardown = options.teardown || null;
    this.resetState = options.resetState || null;
    this.settings = options.settings;
    this.operationMap = {};
    this.state;
  }

  mapOperation(dimensions, op) {
    if (!Array.isArray(dimensions)) dimensions = [dimensions];
    for (const dimension of dimensions) {
      this.operationMap[dimension] = op;
    }
  }

  getOperation(dimension, property) {
    return () => this.operationMap[dimension](dimension, property);
  }

  * buildOperationSet(testCase) {
    const properties = testCase.trim().split(' ');
    for (let i = 0; i < properties.length; i++) {
      yield this.getOperation(this.dimensions[i], properties[i]);
    }
  }
}