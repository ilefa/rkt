import { getRawEnrollment } from '@ilefa/husky';

const TEST_CASES = [
    {
        termCode: '1208',
        classNumber: '6011',
        classSection: '001'
    }
]

let resultSet = TEST_CASES.map(res => getRawEnrollment(res.termCode, res.classNumber, res.classSection));

Promise
    .all(resultSet)
    .then(console.log);