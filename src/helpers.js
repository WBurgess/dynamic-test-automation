import path from 'path';
import callsite from 'callsite';

import generators from './generators';

const dynamicTest = function(description, testDefinition) {
  const stack = callsite();
  const dimensionPath = path.dirname(stack[1].getFileName());
  const dimensions = require(path.join(dimensionPath, './dimensions.js'));
  const operationMap = require(path.join(dimensionPath, './operations.js'));
  const testCases = generators.testCases(dimensions);
  
  return describe(description, () => {
    for (const testCase of testCases) {
      describe(`${testCase.case}`, () => {
        beforeEach( async () => {
          const operations = operationMap.buildOperationSet(testCase.permutation);
          for (const operation of operations) {
            await operation();
          }
        });
        testDefinition();
      }, operationMap.settings.timeout);
    }
  });
}

export default dynamicTest;