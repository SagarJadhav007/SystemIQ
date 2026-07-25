export async function getProblems() {

    const res = await fetch(

        "http://localhost:5000/api/problems"

    );

    return await res.json();

}

export async function getProblem(

    id: string

) {

    const res = await fetch(

        `http://localhost:5000/api/problems/${id}`

    );

    return await res.json();

}