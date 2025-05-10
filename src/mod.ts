import { deepMerge } from "@cross/deepmerge";
import { buildAbsoluteURL } from "url-toolkit";

/**
 * HTTP request methods
 */
export type HTTPMethod =
    | "GET"
    | "HEAD"
    | "POST"
    | "PUT"
    | "DELETE"
    | "CONNECT"
    | "OPTIONS"
    | "TRACE"
    | "PATCH";

/**
 * error throwed on error response (e.g. response with status code of 403 or 500)
 * @see RESTClient
 */
export class RESTError extends Error {
    /** REST request method to the response */
    readonly method: HTTPMethod;
    /** REST request URL to the response */
    readonly url: string;

    /** REST response that respond the error */
    readonly response: Response;

    constructor(method: HTTPMethod, url: string, res: Response) {
        const { status } = res;
        const msg = `request "${method} ${url}" respond with status ${status}`;

        super(msg);

        this.method = method;
        this.url = url;
        this.response = res;
    }
}

/**
 * A REST request client.
 *
 * uses fetch API to send requests and get responses.
 *
 * on request, it automatically serialize request body to JSON format and set
 * "Content-Type" to "application/json".
 *
 * on response, if success and response is ok, it automatically parse response
 * body to object. if response is not ok, `RESTError` is throwed.
 *
 * Notes:
 * - for "HEAD" requests, response headers are returned instead of response body.
 * - for "OPTIONS" requests, the "Allow" response header, instead of response body,
 *   is returned, as an array of string.
 * - "CONNECT" requests do not return data.
 *
 * errors during fetch (e.g. `AbortError`, `NotAllowedError`) are throwed as-is.
 *
 * @see RESTError
 */
export class RESTClient {
    readonly fetchFn: typeof fetch;
    readonly baseURL: string;
    defaultOptions: RequestInit;

    /**
     * construct a REST client with optional base URL, default options and a
     * customized fetch function.
     */
    constructor(
        baseURL?: string,
        defaultOptions?: RequestInit,
        fetchFn?: typeof fetch,
    ) {
        this.fetchFn = fetchFn ?? fetch;
        this.baseURL = baseURL ?? "";
        this.defaultOptions = { ...defaultOptions };
    }

    /**
     * update default options.
     *
     * this can be used to set authentication bearer header.
     */
    updateOptions(options: RequestInit): void {
        this.defaultOptions = deepMerge(this.defaultOptions, options);
    }

    /**
     * update the value of `Authentication` header in default options using `token`
     */
    auth(token: string): void {
        const headers = { Authentication: token };
        const opt: RequestInit = { headers };
        this.updateOptions(opt);
    }

    /**
     * send a REST request, returns Response.
     *
     * if response is not ok, a `RESTError` is throwed.
     *
     * @see RESTError
     * @see get
     * @see head
     * @see post
     * @see put
     * @see patch
     * @see delete
     * @see options
     * @see connect
     * @see trace
     */
    // deno-lint-ignore no-explicit-any
    async send<T = any>(
        method: HTTPMethod,
        path: string,
        params?: URLSearchParams,
        data?: T,
        options?: RequestInit,
    ): Promise<Response> {
        const search = params ? `?${params.toString()}` : "";
        const relative = `${path}${search}`;
        const url = buildAbsoluteURL(this.baseURL, relative);

        const opt: RequestInit = { ...options };
        opt.method = method;

        if (data) {
            const headers = { "Content-Type": "application/json" };
            opt.headers = deepMerge(opt.headers, headers);

            opt.body = JSON.stringify(data);
        }

        const res = await this.fetchFn(url, opt);

        if (!res.ok) {
            throw new RESTError(method, url, res);
        }

        return res;
    }

    /**
     * send a REST request
     */
    // deno-lint-ignore no-explicit-any
    async #getParsedResponseBody<T = any, U = any>(
        method: HTTPMethod,
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        const res = await this.send(method, path, params, data, options);
        return await res.json();
    }

    /**
     * send a GET request
     */
    // deno-lint-ignore no-explicit-any
    async get<T = any>(
        path: string,
        params?: URLSearchParams,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#getParsedResponseBody(
            "GET",
            path,
            params,
            undefined,
            options,
        );
    }

    /**
     * send a HEAD request, returns response headers
     */
    async head(
        path: string,
        params?: URLSearchParams,
        options?: RequestInit,
    ): Promise<Headers> {
        const res = await this.send("HEAD", path, params, undefined, options);
        return res.headers;
    }

    /**
     * send a POST request
     */
    // deno-lint-ignore no-explicit-any
    async post<T = any, U = any>(
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#getParsedResponseBody(
            "POST",
            path,
            params,
            data,
            options,
        );
    }

    /**
     * send a PUT request
     */
    // deno-lint-ignore no-explicit-any
    async put<T = any, U = any>(
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#getParsedResponseBody(
            "PUT",
            path,
            params,
            data,
            options,
        );
    }

    /**
     * send a DELETE request
     *
     * Note: request body may be ignored by server.
     */
    // deno-lint-ignore no-explicit-any
    async delete<T = any, U = any>(
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#getParsedResponseBody(
            "DELETE",
            path,
            params,
            data,
            options,
        );
    }

    /**
     * send a PATCH request
     */
    // deno-lint-ignore no-explicit-any
    async patch<T = any, U = any>(
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#getParsedResponseBody(
            "PATCH",
            path,
            params,
            data,
            options,
        );
    }

    /**
     * send an OPTIONS request
     *
     * returns allowed methods as an array of string. if "Allow" header not
     * exists in response, an empty array is returned.
     *
     * Note: request body may be ignored by server.
     */
    // deno-lint-ignore no-explicit-any
    async options<T = any>(
        path: string,
        params?: URLSearchParams,
        data?: T,
        options?: RequestInit,
    ): Promise<HTTPMethod[]> {
        const res = await this.send(
            "OPTIONS",
            path,
            params,
            data,
            options,
        );
        const allow = res.headers.get("Allow");

        if (allow === null) {
            console.warn({
                msg: 'response does not have an "Allow" header',
                response: res,
            });
            return [];
        }

        return allow.split(/\s*,\s*/) as HTTPMethod[];
    }

    /**
     * send a CONNECT request
     */
    async connect(
        path: string,
        params?: URLSearchParams,
        options?: RequestInit,
    ): Promise<void> {
        await this.send(
            "CONNECT",
            path,
            params,
            undefined,
            options,
        );
    }

    /**
     * send a TRACE request
     *
     * Note: insecure, usually disallowed by server.
     */
    // deno-lint-ignore no-explicit-any
    async trace<T = any>(
        path: string,
        params?: URLSearchParams,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#getParsedResponseBody(
            "TRACE",
            path,
            params,
            undefined,
            options,
        );
    }
}
