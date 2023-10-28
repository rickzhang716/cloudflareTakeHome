
export interface Env {
    ORG: KVNamespace;
}

export async function onRequestGet(context){
    const res = await env.ORG.get("fixed_org")
    return new Response(res,{
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    });
}