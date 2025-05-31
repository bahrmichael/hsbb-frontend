import { list } from '@vercel/blob';

export async function load() {
	try {
		const { blobs } = await list({
			prefix: 'outstanding-couriers.json'
		});

		if (blobs.length === 0) {
			throw new Error('File not found');
		}

		const firstBlob = blobs[0];

		const response = await fetch(firstBlob.url);
		const couriers = await response.json();

		return {
			couriers
		};
	} catch (error) {
		console.error('Error loading oustanding couriers:', error);
		return {
			couriers: []
		};
	}
}
