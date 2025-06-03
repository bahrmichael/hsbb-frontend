import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { env } from '$env/dynamic/private';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
	const token = cookies.get('token-v2');
	if (!token) {
		return new Response(null, { status: 200 });
	}
	try {
		await decodeJwt(token, 'token-v2');
	} catch (e) {
		console.error(e);
		return new Response(null, { status: 200 });
	}

	const store = url.searchParams.get('store');
	const compact = url.searchParams.get('compact') ?? false;
	const campaign = url.searchParams.get('campaign') ?? '';
	try {
		await ddb.send(
			new UpdateCommand({
				TableName: env.AWS_STORE_TABLE_NAME,
				Key: {
					pk: `store-view#${store}#${compact}`,
					sk: `${new Date().toISOString().split('T')[0]}`
				},
				UpdateExpression:
					'set #counter = if_not_exists(#counter, :init) + :inc, #campaign = :campaign',
				ExpressionAttributeValues: {
					':inc': 1,
					':init': 0,
					':campaign': campaign
				},
				ExpressionAttributeNames: {
					'#counter': 'counter',
					'#campaign': 'campaign'
				}
			})
		);
	} catch (e) {
		console.error('store-view', { store }, e);
	}
	return new Response(null, { status: 200 });
}
