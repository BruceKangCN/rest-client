# REST Client

A simple `fetch` based REST client.

## Usage

1. create a client:

   ```ts
   import { RestClient } from "@bruce/rest-client";

   const client = new RestClient();

   // or with baseURL / default options
   const clientWithURL = new RestClient(baseURL);
   const clientWithOpt = new RestClient(baseURL, defaultOptions);
   ```

2. send requests using the client:

   ```ts
   interface Bar {}

   const params: URLSearchParams | undefined = undefined;
   const options: RequestInit | undefined = undefined;
   const bar: Bar = await client.get("./foo", params, options);

   const data: Bar = bar;
   const baz: any = await client.post("./bar", params, data, options);
   ```

## Tests

set environment variables used in tests:

- `REALWORLD_BASE_URL`: base URL for the realworld API, default to
  `https://api.realworld.io/api/`
- `REALWORLD_USER_EMAIL`: email used in login process, no default value
- `REALWORLD_USER_PASSWORD`: password used in login process, no default value

> You can set them in a `.env` file in the project root directory:
>
> ```shell
> REALWORLD_BASE_URL=https://api.realworld.io/api/
> REALWORLD_USER_EMAIL=foo@example.com
> REALWORLD_USER_PASSWORD=abc123
> ```

then run tests with deno:

```shell
$ # run tests with read, write, environment, net permissions
$ deno test -RWE --allow-net
```
