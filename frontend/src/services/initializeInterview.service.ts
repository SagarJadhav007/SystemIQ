import axios from "axios";
import { getSession } from "./auth.service";

export async function initializeInterview(interviewId: string) {

    const session = await getSession();

    const { data } = await axios.post(

        "${API_URL}/api/interview/initialize",

        {

            interviewId

        },

        {

            headers: {

                Authorization: `Bearer ${session?.access_token}`

            }

        }

    );

    return data;

}