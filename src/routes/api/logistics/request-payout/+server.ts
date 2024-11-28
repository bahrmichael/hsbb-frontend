import { error } from '@sveltejs/kit';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';
import axios from 'axios';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies }) {
	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}
	const { characterId } = await decodeJwt(token, 'token-v1');

	const transactions = (await ddb.send(new QueryCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		KeyConditionExpression: `pk = :pk and begins_with(sk, :sk)`,
		ExpressionAttributeValues: {
			':pk': `character#${characterId}`,
			':sk': 'transaction#'
		},
		ScanIndexForward: false
	}))).Items ?? [];

	const sorted = transactions.sort((a: any, b: any) => b.created - a.created);
	const balance = sorted[0]?.balance ?? 0;

	if (balance <= 0) {
		return new Response(JSON.stringify({ result: 'insufficient_balance' }), { status: 400 });
	}

	await ddb.send(new PutCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Item: {
			pk: `payoutRequests`,
			sk: `character#${characterId}`,
			characterId,
			create: new Date().toISOString(),
			version: '2'
		},
	}));

	try {
		await axios.post(env.DISCORD_WEBHOOK, {
			content: `We received a new payout request.`
		});
	} catch {
		console.error('Failed to send request to discord.')
	}
	return new Response(JSON.stringify({ result: 'created' }), { status: 200 });
}