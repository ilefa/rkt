import { getClosestMatches } from "@ilefa/ivy";

const valid = [
    'average',
    'assure',
    'audacity',
    'engulged',
    'calendar',
    'tortilla',
    'grass',
    'generation',
    'stonks',
    'stocks'
]

let input = 'stock';
let closest = getClosestMatches(input, valid);

console.log('All:', closest);
console.log('Closest:', closest[0]);