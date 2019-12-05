import { createPermutations } from 'qaAutomation/dynamicTestAutomation/permutationGenerator/permutationGenerator.js';
import expectEqual from 'test/helpers/expectEqual';
import fs from 'fs-extra';
import path from 'path';

describe(`Validate permutation generator accuracy`, function() {
  test(`Generate new permutations from same input dimensions and compare against expected output`, async function() {
    const testDataPath = path.join(__dirname, `/permutationTestData.json`);
    const outputPath = path.join(__dirname, `/permutationTestOutput.json`);
    const testData = await fs.readJSON(testDataPath);
    await createPermutations(testData.input, outputPath);
    const newPermutations = await fs.readJSON(outputPath);
    try {
      await expectEqual(newPermutations, testData.expectedOutput);
      await fs.remove(outputPath);
    } 
    catch(err) {
      await fs.remove(outputPath);
      if (err) { 
        throw new Error(err);
      }
    }
  });
});
