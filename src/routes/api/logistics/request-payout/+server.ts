import { error } from '@sveltejs/kit';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';
import { checkAuth } from '$lib/auth-helpers';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, request }) {
	const authResult = await checkAuth(cookies, request.url);
	if (authResult.requiresSignIn) {
		throw error(401, 'Unauthorized');
	}
	const { characterId } = authResult;

	const transactions =
		(
			await ddb.send(
				new QueryCommand({
					TableName: env.AWS_LOGISTICS_TABLE_NAME,
					KeyConditionExpression: `pk = :pk and begins_with(sk, :sk)`,
					ExpressionAttributeValues: {
						':pk': `character#${characterId}`,
						':sk': 'transaction#'
					},
					ScanIndexForward: false
				})
			)
		).Items ?? [];

	const sorted = transactions.sort((a: any, b: any) => b.created - a.created);
	const balance = sorted[0]?.balance ?? 0;

	if (balance <= 0) {
		return new Response(JSON.stringify({ result: 'insufficient_balance' }), { status: 400 });
	}

	await ddb.send(
		new PutCommand({
			TableName: env.AWS_LOGISTICS_TABLE_NAME,
			Item: {
				pk: `payoutRequests`,
				sk: `character#${characterId}`,
				characterId,
				create: new Date().getTime(),
				version: '2'
			}
		})
	);

	return new Response(JSON.stringify({ result: 'created' }), { status: 200 });
}
