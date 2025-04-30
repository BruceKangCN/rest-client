import { sprintf } from "@std/fmt/printf";
import "@std/dotenv/load";
import {
    assert,
    assertEquals,
    assertGreater,
    assertInstanceOf,
    assertThrows,
} from "@std/assert";

import { RestClient, RESTError } from "./mod.ts";
import * as RealWorld from "./real_world.ts";

Deno.test(async function testRestClientOptions(t) {
    await t.step(function testUpdateOptions() {
        const defaultHeaders = { "Content-Type": "application/json" };
        const client = new RestClient(undefined, { headers: defaultHeaders });

        const newHeaderKey = "Accept";
        const newHeaderValue = "application/json";

        const opt = { headers: { [newHeaderKey]: newHeaderValue } };
        client.updateOptions(opt);

        const headers = new Headers(client.defaultOptions.headers);
        assertEquals(headers.get(newHeaderKey), newHeaderValue);
        assert(
            Object.entries(defaultHeaders).filter(([key, _]) =>
                key !== newHeaderKey
            ).every(([key, value]) => headers.get(key) === value),
        );
    });

    await t.step(function testAuth() {
        const defaultHeaders = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
        const client = new RestClient(undefined, { headers: defaultHeaders });
        const token = "Bearer abc123";

        client.auth(token);
        const headers = new Headers(client.defaultOptions.headers);
        assertEquals(headers.get("Authentication"), token);
    });
});

Deno.test(async function testRestClientRequestsWithoutAuth(t) {
    const key = "REALWORLD_BASE_URL";
    const defaultBaseURL = "https://api.realworld.io/api/";
    const baseURL = Deno.env.get(key) ?? defaultBaseURL;
    const client = new RestClient(baseURL);

    // test GET with no parameter
    await t.step(async function tags() {
        const { tags }: RealWorld.TagsResponse = await client.get("./tags");

        assertInstanceOf(tags, Array);
        assertGreater(tags.length, 0);
        assert(tags.every((item) => typeof item === "string"));
    });

    // test GET with parameters
    await t.step(async function articles() {
        const limit = 5;
        const params = new URLSearchParams({ limit: limit.toString() });
        const { articles, articlesCount }: RealWorld.MultipleArticlesResponse =
            await client.get("./articles", params);

        assert(typeof articlesCount === "number");
        assertGreater(articlesCount, 0);

        assertInstanceOf(articles, Array);
        assertEquals(articles.length, articlesCount);
        articles.every((item) => assertInstanceOf(item, RealWorld.Article));
    });

    // test POST
    await t.step(async function users() {
        assertThrows(await client.get("./users"));

        const data: RealWorld.NewUserRequest = {
            user: {
                username: "foo",
                "email": "foo@example.com",
                password: "abc123",
            },
        };
        try {
            await client.post("./users", undefined, data);
        } catch (err) {
            assertInstanceOf(err, RESTError);
            assertEquals(err.response.status, 422);
        }
    });
});

Deno.test(async function testRestClientRequestsWithAuth(t) {
    const key = "REALWORLD_BASE_URL";
    const defaultBaseURL = "https://api.realworld.io/api/";
    const baseURL = Deno.env.get(key) ?? defaultBaseURL;
    const client = new RestClient(baseURL);

    // test POST, also do login, always runs before other steps
    {
        const fmt = [
            "%s not set, skip authentication tests.",
            "did you forget to set `%s` environment variable?",
        ].join(" ");

        const email = Deno.env.get("REALWORLD_USER_EMAIL");
        if (email === undefined) {
            console.warn(sprintf(
                fmt,
                "user email",
                "REALWORLD_USER_EMAIL",
            ));
            return;
        }

        const password = Deno.env.get("REALWORLD_USER_PASSWORD");
        if (password === undefined) {
            console.warn(sprintf(
                fmt,
                "user password",
                "REALWORLD_USER_PASSWORD",
            ));
            return;
        }

        const user: RealWorld.LoginUser = { email, password };
        const data: RealWorld.LoginUserRequest = { user };
        const res = await client.post(
            "./users/login",
            undefined,
            data,
        );
        assertInstanceOf(res, RealWorld.UserResponse);

        client.auth(res.user.token);
    }

    // test GET with parameters
    await t.step(async function articles() {
        const limit = 5;
        const params = new URLSearchParams({ limit: limit.toString() });
        const { articles, articlesCount }: RealWorld.MultipleArticlesResponse =
            await client.get("./articles", params);

        assert(typeof articlesCount === "number");
        assertGreater(articlesCount, 0);

        assertInstanceOf(articles, Array);
        assertEquals(articles.length, articlesCount);
        articles.every((item) => assertInstanceOf(item, RealWorld.Article));
    });

    // test PUT with data
    await t.step(async function UpdateUser() {
        const email = "foo@example.com";
        const user: RealWorld.UpdateUser = { email };
        const data: RealWorld.UpdateUserRequest = { user };

        const res = await client.put("./users", undefined, data);
        assertInstanceOf(res, RealWorld.UserResponse);
    });

    // test POST and DELETE with path parameter
    await t.step(async function follow() {
        const username = "foo";
        const path = `./profiles/${username}/follow`;

        const postRes = await client.post(path);
        assertInstanceOf(postRes, RealWorld.ProfileResponse);

        const deleteRes = await client.delete(path);
        assertInstanceOf(deleteRes, RealWorld.ProfileResponse);
    });
});
