# Dynamic Test Automation
The usual model for testing software is different variations of the same concept: test only what you need to. There is a cost to developing tests and this cost eats into developing the product. The goal of Dynamic Test Automation (DTA) is to build out *every* possible permutation of tests for a given feature, without writing those tests "by hand".

**DTA requires jest or mocha to run**, which should be installed and configured in your repo before installing DTA. A full standalone version is in the works, but for now DTA just hooks up to the globally exposed hooks from either of those modules.

## The Feature Model
For this kind of testing, we use a simple feature model defined by the following properties:

1. **Initial State**: A known, familiar state to the user.

2. **Operations**: A set of actions that affect the initial state.

3. **Expected State**: How the user expected the state to change for the given operations.

## Parts of a Dynamic Test
DTA works by defining various _dimensions_, which are arrays of _properties_. It will build out the cartesian product of all of the defined dimensions to generate a test case, and tie a set of operations to that test case. You can define as many dimensions with as many properties in each as you like, but beware that each property added will double the amount of total tests!

##### dimensions.js
```javascript
const dimensions = {
  bunType: [ "regular", "poppySeed", "none" ],
  cheeseType: [ "cheddar", "american", "pepperJack", "gouda", "noCheese" ],
  veggies: [ "lettuce", "tomato", "onion", "pickles" ],
  condiments: [ "ketchup", "mustard", "mayo" ],
  meatType: [ "beef", "pork", "tofu"]
}
```
These dimensions would result in 540 test cases. The test case generator builds cases bottom-up, so the first test case here would be:
```javascript
bunType: "regular" - cheeseType: "cheddar" - veggies: "lettuce" - condiments: "ketchup" - meatType: "beef"
```
It is recommended that your dimensions are pulled from enums/constants from within the application so the generated tests update alongside your source.

These test cases are mapped to callbacks via the Operations class. This is where you can pull in application code, mocks, etc and tie them to a dimension. For example:
##### operations.js
```javascript
const ops = new Operations(Object.keys(dimensions));
ops.mapOperation('bunType', property => ops.state.bunType = property);
```
When the class is parsing the test case above, it will run that callback when it encounters `bunType`. These callbacks always only take one argument, which is the currently-iterated property of that dimension. In the case of `bunType`, it's properties are: `regular`, `poppySeed`, `tofu`.

A dynamic test cannot work without a callback provided for every dimension. It will throw an error if a dimension is encountered that does not have a registered callback.

Operations are executed **in the order that the dimensions are defined.** This means that, in the above example `dimensions.js`, the execution order is: `bunType` -> `cheeseType` -> `veggies` -> `condiments` -> `meatType`. This allows authors to structure the operation callbacks in a co-dependent manner. Ideally, mocks can grease the wheels here.

## The dynamicTest helper 
The `dynamicTest` helper takes care of test case construction and operation execution for you. It returns a `describe` definition using your test definition:
```javascript
dynamicTest(`Test E V E R Y T H I N G`, () => {
  afterEach(() => {
    // Reset initial state after each test
    ops.state = {...initialStateObject};
  });

  // Each "test" will run against 540 different permutations of the initial state
  test(`changeMeat() testing`, () => {
    changeMeat(ops.state, 'tofu');
    expect(ops.state.meatType).toEqual('tofu');
  });
});
```
Using `dynamicTest` requires that your `dimensions.js` and `operations.js` exist in the same directory as your test definition (for now). It also means that you cannot define a new `beforeEach()`, as it will overwrite the pre-built one.

Alternatively, you can import `Generators` directly, and use it inside a regular test. A dynamic test has to be set up within a nested describe, within a loop:
```javascript
const dimensions = require(`path-to-dimension.js`);
const ops = require(`path-to-operations-instance`));
const testCases = generators.testCases(dimensions);

describe(`Test E V E R Y T H I N G`, () => {
  for (const testCase of testCases) {
    describe(`${testCase.case}`, () => {
      beforeEach( async () => {
        const operations = ops.buildOperationSet(testCase.permutation);
        for (const operation of operations) {
          await operation();
        }
      });

      afterEach(() => {
        // Reset initial state after each test
        ops.state = {...initialStateObject};
      });

      // Each "test" will run against 540 different permutations of the initial state
      test(`changeMeat() testing`, () => {
        changeMeat(ops.state, 'tofu');
        expect(ops.state.meatType).toEqual('tofu');
      });
    });
  }
});