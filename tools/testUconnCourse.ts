import { searchCourse } from '@ilefa/husky';

const TEST_CASES = [
    'CSE1729',
    'MATH1132Q',
    'GEOG1700'
]

let resultSet = TEST_CASES.map(name => searchCourse(name));

Promise
    .all(resultSet)
    .then(res => console.log(JSON.stringify(res)));