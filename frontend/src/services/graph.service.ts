import axios from "axios";
import { supabase } from "../lib/supabase";

const API = "http://localhost:5000/api";

export async function saveGraph(
    interviewId: string,
    graph: any
) {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    await axios.post(

        `${API}/interview/graph`,

        {
            interviewId,
            graph
        },

        {
            headers: {
                Authorization: `Bearer ${session?.access_token}`
            }
        }

    );

}