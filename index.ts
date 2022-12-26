// Test utils

const testBlock = (name: string): void => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const areEqual = (a: any, b: any): boolean => {
    return a === b;
    // Compare arrays of primitives
    // Remember: [] !== []
};

const arraysAreEqual = (a: any[], b: any[]): boolean => {
    return JSON.stringify(a) === JSON.stringify(b);
};

// Function takes primitimes as well as arrays as arguments
const test = (whatWeTest: string, actualResult: any, expectedResult: any): void => {
    const areEqualRes: boolean =
        Array.isArray(actualResult) && Array.isArray(expectedResult)
            ? arraysAreEqual(actualResult, expectedResult)
            : areEqual(actualResult, expectedResult);

    if (areEqualRes) {
        console.log(`[OK] ${whatWeTest}\n`);
    } else {
        console.error(`[FAIL] ${whatWeTest}`);
        console.debug('Expected:');
        console.debug(expectedResult);
        console.debug('Actual:');
        console.debug(actualResult);
        console.log('');
    }
};

// Functions

const getType = (value: any): string => {
    // Return string with a native JS type of value
    return typeof value;
};

const getTypesOfItems = (arr: any): string[] => {
    // Return array with types of items of given array
    return arr.map((item: any) => getType(item));
};

const allItemsHaveTheSameType = (arr: any): boolean => {
    // Return true if all items of array have the same type
    const typeOfFirstEl = getType(arr[0]);
    return arr.every((item: any) => getType(item) === typeOfFirstEl);
};

const getRealType = (value: any): string => {
    // Return string with a “real” type of value.
    // For example:
    //     typeof new Date()       // 'object'
    //     getRealType(new Date()) // 'date'
    //     typeof NaN              // 'number'
    //     getRealType(NaN)        // 'NaN'
    // Use typeof, instanceof and some magic. It's enough to have
    // 12-13 unique types but you can find out in JS even more :)
    if (Number.isNaN(value)) {
        return 'NaN';
    }
    if (typeof value === 'number' && !isFinite(value)) {
        return 'Infinity';
    }

    return Object.prototype.toString.call(value).split(' ')[1].slice(0, -1).toLowerCase();
};

const getRealTypesOfItems = (arr: any[]): string[] => {
    // Return array with real types of items of given array
    return arr.map((item: any) => getRealType(item));
};

const everyItemHasAUniqueRealType = (arr: any[]): boolean => {
    // Return true if there are no items in array
    // with the same real type
    const realTypesArray: string[] = getRealTypesOfItems(arr);
    return new Set(realTypesArray).size === realTypesArray.length;
};

const countRealTypes = (arr: any[]): [string, number][] => {
    // Return an array of arrays with a type and count of items
    // with this type in the input array, sorted by type.
    // Like an Object.entries() result: [['boolean', 3], ['string', 5]]
    interface iResultData {
        [key: string]: number;
    }
    const resultData: iResultData = {};
    arr.forEach((elem: any) => {
        const type: string = getRealType(elem);
        if (!resultData[type]) {
            resultData[type] = 1;
        } else {
            resultData[type] = resultData[type] + 1;
        }
    });
    const result: [string, number][] = Object.keys(resultData)
        .sort()
        .map((key: string) => [key, resultData[key]]);

    return result;
};

// Tests

testBlock('getType');

test('Boolean', getType(true), 'boolean');
test('Number', getType(123), 'number');
test('String', getType('whoo'), 'string');
test('Array', getType([]), 'object');
test('Object', getType({}), 'object');
test(
    'Function',
    getType(() => {}),
    'function'
);
test('Undefined', getType(undefined), 'undefined');
test('Null', getType(null), 'object');

testBlock('allItemsHaveTheSameType');

test('All values are numbers', allItemsHaveTheSameType([11, 12, 13]), true);

test('All values are strings', allItemsHaveTheSameType(['11', '12', '13']), true);

test(
    'All values are strings but wait',
    allItemsHaveTheSameType(['11', new String('12'), '13']),
    // What the result?
    // Result is "false" as "new String()" expression is an object
    false
);

test(
    'Values like a number',
    allItemsHaveTheSameType([123, 123 / 'a', 1 / 0]),
    // What the result?
    // Result is "true" as NaN is numeric type
    true
);

test('Values like an object', allItemsHaveTheSameType([{}]), true);

testBlock('getTypesOfItems VS getRealTypesOfItems');

const knownTypes = [
    // Add values of different types like boolean, object, date, NaN and so on
    false,
    123,
    'abcde',
    [1, 2, 3],
    { id: 1 },
    (x: number) => x * 2,
    undefined,
    null,
    'a' / 3,
    1 / 0,
    new Date('2020-05-12T23:50:21.817Z'),
    /[abcd]+/,
    new Set([1, 2, 3, 4]),
    new Map(),
];

test('Check basic types', getTypesOfItems(knownTypes), [
    // What the types?
    'boolean',
    'number',
    'string',
    'object',
    'object',
    'function',
    'undefined',
    'object',
    'number',
    'number',
    'object',
    'object',
    'object',
    // What else?
    'object',
]);

test('Check real types', getRealTypesOfItems(knownTypes), [
    'boolean',
    'number',
    'string',
    'array',
    'object',
    'function',
    'undefined',
    'null',
    'NaN',
    'Infinity',
    'date',
    'regexp',
    'set',
    // What else?
    'map',
]);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);

test('Two values have the same type', everyItemHasAUniqueRealType([true, 123, '123' === 123]), false);

test('There are no repeated types in knownTypes', everyItemHasAUniqueRealType(knownTypes), true);

testBlock('countRealTypes');

test('Count unique types of array items', countRealTypes([true, null, !null, !!null, {}]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Counted unique types are sorted', countRealTypes([{}, null, true, !null, !!null]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

// Add several positive and negative tests

const everyItemIsNaN = (arr: any[]) => {
    // Return true if all items are NaN
    return arr.every((item: any) => getRealType(item) === 'NaN');
};

const everyItemIsFinite = (arr: any[]) => {
    // Return true if all items are finite
    return arr.every((item: any) => Number.isFinite(item));
};

testBlock('myTestAllAreNaN');

test('All the items are NaN', everyItemIsNaN([Infinity / Infinity, NaN + 1, parseInt('nikita', 5)]), true);

testBlock('myTestAllAreFinite');

test('All values are numeric', everyItemIsFinite([123, 113.2, 23 / 12]), true);

test('Has String', everyItemIsFinite([123, 113.2, '123']), false);

test('Has Infinity', everyItemIsFinite([123, 113.2, Infinity]), false);

test('Has NaN', everyItemIsFinite([NaN, 123]), false);
