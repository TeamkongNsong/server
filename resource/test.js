const input = [{
        name: "Douglas Crawford",
        salary: 80000,
        address: {
            line1: "c/o Unstructured Programmers Anonymous",
            line2: "7723 Western Avenue",
            city: "San Francisco",
            state: "CA",
            zip: "9123"
        }
    },
    {
        name: "Brian Kernighan",
        salary: 60000,
        address: {
            line1: "PO BOX 455",
            city: "Princeton",
            state: "NJ",
            zip: "08544"
        }
    }
];

/*
1. 배열 돌기
2. 각 object들의 value의 타입별로 구분.
3. 배열안의 0~end까지 각 obj들의 properties들이 같은 이름을 가지고 있었는지에 대한 처리.(보류)
*/

const inferredJSONFormat = (input) => {
    let result = {};

    function recursion(input) {
        console.log(input);
        if (Array.isArray(input)) {
            result = {
                something: 'array',
            };
            input.forEach((something) => {
                recursion(something);
            });
        }

        if (typeof input === 'object') {
            for (let key in input) {
                return ;
            }
        }

        if (typeof input === 'string') {
            result = {
                input: 'string',
            };
        }

        if (typeof input === 'number') {
            result = {
                input: 'number',
            };
        }

        if (typeof input === 'symbol') {
            result = {
                input: 'symbol',
            };
        }

        if (typeof input === 'function') {
            result = {
                input: 'function',
            };
        }

        if (typeof input === 'undefined') {
            result = {
                input: 'undefined',
            };
        }
    }

    recursion(input);
    console.log('result',result);
    return result;
};

console.log(inferredJSONFormat(input));
