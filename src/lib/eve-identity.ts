import axios from "axios";

export async function getAccessToken(ownerId: number, minimumDuration: number = 15): Promise<{accessToken: string}> {
    return (await axios.get(`https://uc4v3lk6rh.execute-api.us-east-1.amazonaws.com/dev/app/hsbb-jobs/character/${ownerId}/token/?delay=${minimumDuration}`, {
        headers: {
            'x-api-key': process.env.IDENTITY_KEY,
        }
    })).data;
}