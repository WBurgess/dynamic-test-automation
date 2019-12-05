import path from 'path';
import callsite from 'callsite';

import { Operations } from './operations';
import generators from './generators';

const dynamicTest = function(description, testDefinition) {
  const stack = callsite();
  const dimensionPath = path.dirname(stack[1].getFileName());
  const dimensions = require(path.join(dimensionPath, './dimensions.js'));
  const operationMap = require(path.join(dimensionPath, './operationMap.js'));
  const testCases = generators.testCases(dimensions);
  
  return describe(description, () => {
    for (const testCase of testCases) {
      describe(`${testCase.case}`, () => {
        beforeAll(() => operationMap.init());
        beforeEach( async () => {
          const operations = operationMap.buildOperationSet(testCase.permutation);
          for (const operation of operations) {
            await operation();
          }
        });
        afterEach(() => operationMap.resetState());
        afterAll(() => operationMap.teardown());
        testDefinition();
      });
    }
  });
}

module.exports = {
  dynamicTest,
  Operations,
  generators
}