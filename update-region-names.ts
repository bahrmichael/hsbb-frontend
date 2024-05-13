import { writeFileSync } from 'fs';

(async() => {
	console.log('loading region ids');
	const r1 = await fetch(`https://esi.evetech.net/v1/universe/regions`);
	const regionIdList = await r1.json();
	console.log('translating names');
	const r2 = await fetch(`https://esi.evetech.net/v3/universe/names/`, {
		method: 'POST',
		body: JSON.stringify(regionIdList)
	});
	// @ts-ignore
	const names = (await r2.json()).filter(c => c.category === 'region').map(c => c.name);
	console.log(names);

	writeFileSync('./static/region-names.json', JSON.stringify(names));
})();