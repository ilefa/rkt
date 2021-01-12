import axios from 'axios';
import cheerio from 'cheerio';

import { timeDiff } from '../src/lib/util';

type MinorData = {
    name: string;
    url: string;
};

(async () => {
    let start = Date.now();
    let results: MinorData[] = [];
    let data = await axios
        .get('https://catalog.uconn.edu/minors/')
        .then(res => res.data)
        .catch(err => {
            console.log(err);
            return null;
        });

    let $ = cheerio.load(data);
    $('.tab-pane.multi-column').each(i => {
        $(`.tab-pane.multi-column:nth-child(${i + 1}) > .extra-space-list`).each(_i => {
            $(`.tab-pane.multi-column:nth-child(${i + 1}) > .extra-space-list > li`).each(elem => {
                let record = $(`.tab-pane.multi-column:nth-child(${i + 1}) > .extra-space-list > li:nth-child(${elem + 1}) > a`);
                let name = record.text();
                let url = record.attr('href');
                
                results.push({
                    name, url
                });
            })
        });
    })

    console.log(JSON.stringify(results, null, 3));
    console.log(`Collected ${results.length} results in ${timeDiff(start)}ms.`);
})();