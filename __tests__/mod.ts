import { RestClient } from "@bruce/rest-client";

Deno.test(async function testRestClient() {
    const client = new RestClient("http://localhost:5173/api");

    const result = await client.put("/rulesets", undefined, { name: "foo" });

    console.log({ result });
});
