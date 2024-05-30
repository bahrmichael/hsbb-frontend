import { env } from '$env/dynamic/private';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const body = await s3.send(new GetObjectCommand({
		Bucket: env.AWS_BUCKET_NAME,
		Key: 'couriers-snapshot',
	})).then((res) => res.Body);
	return {
		couriers: JSON.parse(body),
	}
}