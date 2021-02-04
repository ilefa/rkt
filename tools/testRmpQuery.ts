import { searchRMP } from "../src/lib/util/uconn";

const TEST_CASES = [
    'Gregory Johnson',
    'David Mcardle',
    'Amit Savkar',
    'Ron Glaz',
    'Yashan Zhang',
    'Funny Alibaba'
]

let resultSet = TEST_CASES.map(name => searchRMP(name));

Promise
    .all(resultSet)
    .then(console.log);