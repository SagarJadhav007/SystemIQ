import { getSession } from "./auth.service";

export async function getHistory() {

    const session = await getSession();

    const res = await fetch(

        "${API_URL}/api/history",

        {

            headers: {

                Authorization:

                    `Bearer ${session?.access_token}`

            }

        }

    );

    if (!res.ok)

        throw new Error("Unable to fetch history");

    return res.json();

}