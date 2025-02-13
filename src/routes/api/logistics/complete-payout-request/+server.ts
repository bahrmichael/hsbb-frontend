import { error } from '@sveltejs/kit';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';
import { ulid } from 'ulid';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, cookies }) {

	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}
	const { name } = await decodeJwt(token, 'token-v1');

	if (name !== 'Lerso Nardieu') {
		throw error(403, 'Forbidden');
	}

	const characterIdParam = url.searchParams.get('characterId');
	if (!characterIdParam) {
		error(400, 'characterId is required');
	}
	const valueParam = url.searchParams.get('value');
	if (!valueParam) {
		error(400, 'value is required');
	}

	const amount = -1 * +valueParam;

	const latestTransaction = ((await ddb.send(new QueryCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
		ExpressionAttributeValues: {
			':pk': `character#${characterIdParam}`,
			':sk': 'transaction#',
		},
		ScanIndexForward: false,
		Limit: 1,
	}))).Items ?? [])[0];

	const newBalance = (latestTransaction?.balance ?? 0) + amount;

	await ddb.send(new PutCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Item: {
			pk: `character#${characterIdParam}`,
			sk: `transaction#${ulid()}`,
			transactionType: 'payout',
			amount,
			balance: newBalance,
			created: Date.now(),
			version: '2'
		}
	}));

	await ddb.send(new DeleteCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Key: {
			pk: `payoutRequests`,
			sk: `character#${characterIdParam}`
		}
	}));

	return new Response(null, { status: 200 });
}
