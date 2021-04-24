import axios from 'axios';
import cheerio from 'cheerio';
import tableparse from 'cheerio-tableparser';

import { timeDiff } from '@ilefa/ivy';

type MajorData = {
    name: string;
    url: string;
};

(async () => {
    let start = Date.now();
    let data = await axios.get('https://catalog.uconn.edu/academic-degree-programs/')
        .then(res => res.data)
        .catch(err => {
            console.error(err);
            return null;
        });

    if (!data) {
        return;
    }

    let $ = cheerio.load(data);
    tableparse($);

    let rows: string[][] = ($('.tablesorter') as any).parsetable();
    let results: MajorData[] = [] = rows[0]
        .slice(1)
        .map(row => cheerio.load(row).html())
        .map(row => {
            return {
                name: row
                    .split(/(#\w)*">/)[2]
                    .split('<\/a>')[0],
                url: row
                    .split('href="')[1]
                    .split(/(#\w)*">\w+(<\/a>)?/)[0]
            }
        })
        .filter(record => !!record.name)
        .sort((a, b) => a.name.localeCompare(b.name));

        console.log(JSON.stringify(results, null, 3));
        console.log(`Collected ${results.length} results in ${timeDiff(start)}ms.`);
})();
