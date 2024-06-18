import { env } from '$env/dynamic/private';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

/** @type {import('./$types').PageServerLoad} */
export async function load({cookies}) {
	const body = await s3.send(new GetObjectCommand({
		Bucket: env.AWS_BUCKET_NAME,
		Key: 'couriers-outstanding',
	})).then((res) => res.Body.transformToString());

	const token = cookies.get('token-ingame');

	return {
		// the filter against d1 is a safety guard that this courier has received all the necessary data, and is not in a broken state
		couriers: JSON.parse(body).filter((c: any) => c.d1 > 0),
		authenticated: !!token,
		characterName: token ? (await decodeJwt(token, 'ingame')).name : undefined,
	}
}