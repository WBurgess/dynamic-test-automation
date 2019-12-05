const generatePermutations = function* (dimensions) {
  const totalDimensions = dimensions.length;
  const dimensionSizes = dimensions.map(dim => dim.length);
  const totalPermutations = dimensionSizes.reduce((a,b) => a * b);
  
  // Build tracking parallel array, used to track the iteration of each dimension bottom-up
  const tracker = [];
  for (let i = 0; i < totalDimensions; i++) {
      tracker[i] = {
          currentPosition: 0,
          canIterate: false,
      };
  }
  tracker[tracker.length - 1].canIterate = true;
  
  // Recursively "Bumps" the currentPosition of the ascending dimension(s)
  const bumpTrain = trackingRow => {
    const rowToAdvance = trackingRow === 0 ? 0 : trackingRow - 1;
    tracker[rowToAdvance].currentPosition++;
    if (tracker[rowToAdvance].currentPosition === dimensionSizes[rowToAdvance] && rowToAdvance !== 0) {
      tracker[rowToAdvance].currentPosition = 0;
      bumpTrain(rowToAdvance);
    }
  }
  
  for (let i = 0; i < totalPermutations; i++) {
    let permutation = ``;
    for (let j = 0; j < tracker.length; j++) {
        const currentTracker = tracker[j];
        const currentSize = dimensionSizes[j];
        permutation += `${dimensions[j][tracker[j].currentPosition]} `;

        if (currentTracker.canIterate) { 
          currentTracker.currentPosition++;
        }
        if (currentTracker.currentPosition === currentSize) {
            currentTracker.currentPosition = 0;
            bumpTrain(j);
        }
    }
    yield(permutation);
  }
}

const testCaseGenerator = function* (dimensionData) {
  const dimensionNames = Object.keys(dimensionData);  
  const dimensions = Object.values(dimensionData);
  const permGenerator = generatePermutations(dimensions)
  for (const permutation of permGenerator) {

    const testCaseProperties = permutation.trim().split(' ');
    const testCase = {
      case: '',
      permutation,
    };
    for (let i = 0; i < testCaseProperties.length; i++) {
      testCase.case += `"${dimensionNames[i]}": ${testCaseProperties[i]} - `;
    }
    yield(testCase);
  }
}

// Generator functions cannot be exported directly
const generators = {
  permutations: generatePermutations,
  testCases: testCaseGenerator
};
export default generators
