import { list } from '@vercel/blob';

export async function load() {
	try {
		// List all files with the prefix 'contract-stats.json'
		const { blobs } = await list({
			prefix: 'contract-stats.json'
		});

		if (blobs.length === 0) {
			throw new Error('No contract stats data found');
		}

		// Use the first file (most recent based on blob listing)
		const firstBlob = blobs[0];

		// Fetch the data from the blob URL
		const response = await fetch(firstBlob.url);
		const contractStats = await response.json();

		return {
			contractStats
		};
	} catch (error) {
		console.error('Error loading contract stats:', error);
		return {
			contractStats: []
		};
	}
}
