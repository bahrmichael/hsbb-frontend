import { error } from '@sveltejs/kit';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';
import { checkAuth } from '$lib/auth-helpers';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ url, cookies, request }) {
	const authResult = await checkAuth(cookies, request.url);
	if (authResult.requiresSignIn) {
		throw error(401, 'Unauthorized');
	}

	if (authResult.name !== 'Lerso Nardieu') {
		throw error(403, 'Forbidden');
	}

	const characterIdParam = url.searchParams.get('characterId');
	if (!characterIdParam) {
		error(400, 'characterId is required');
	}

	await ddb.send(
		new DeleteCommand({
			TableName: env.AWS_LOGISTICS_TABLE_NAME,
			Key: {
				pk: `requests`,
				sk: `character#${characterIdParam}`
			}
		})
	);

	return new Response(null, { status: 200 });
}
