import { deepMerge } from "@cross/deepmerge";

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
    /** REST request coresponding to the response */
    request: Request;

    /** REST response that respond the error */
    response: Response;

    constructor(req: Request, res: Response) {
        const msg =
            `request "${req.method} ${req.url}" respond with status ${res.status}`;
        super(msg);

        this.request = req;
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
 * body to object. if response is not ok, `RESTError` is throwed. for "HEAD"
 * request, response body is ignored and `undefined` is returned.
 *
 * errors during fetch (e.g. `AbortError`, `NotAllowedError`) are throwed as-is.
 *
 * @see RESTError
 */
export class RESTClient {
    baseURL: string;
    defaultOptions: RequestInit;

    /**
     * construct a REST client with optional base URL and default options.
     */
    constructor(baseURL?: string, defaultOptions?: RequestInit) {
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
     * send a REST request
     */
    // deno-lint-ignore no-explicit-any
    async #send<T = any, U = any>(
        method: HTTPMethod,
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        const url = this.#createRequestURL(path, params);
        const opt: RequestInit = { ...options };
        opt.method = method;

        if (data) {
            const headers = { "Content-Type": "application/json" };
            opt.headers = deepMerge(opt.headers, headers);

            opt.body = JSON.stringify(data);
        }

        const req = new Request(url, opt);
        const res = await fetch(req);

        if (!res.ok) {
            throw new RESTError(req, res);
        }

        if (req.method === "HEAD") {
            return undefined as T;
        }

        return await res.json();
    }

    /**
     * construct a request URL.
     * the URL is constructed the resource path `path` and search parameters
     * `params` appended to `baseURL` of the client.
     */
    #createRequestURL(path: string, params?: URLSearchParams): URL {
        const url = new URL(path, this.baseURL);
        url.search = params?.toString() ?? "";

        return url;
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
        return await this.#send("GET", path, params, undefined, options);
    }

    /**
     * send a HEAD request
     */
    async head(
        path: string,
        params?: URLSearchParams,
        options?: RequestInit,
    ): Promise<void> {
        return await this.#send("HEAD", path, params, undefined, options);
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
        return await this.#send("POST", path, params, data, options);
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
        return await this.#send("PUT", path, params, data, options);
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
        return await this.#send("DELETE", path, params, data, options);
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
        return await this.#send("PATCH", path, params, data, options);
    }

    /**
     * send an OPTIONS request
     *
     * Note: request body may be ignored by server.
     */
    // deno-lint-ignore no-explicit-any
    async options<T = any, U = any>(
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#send("OPTIONS", path, params, data, options);
    }

    /**
     * send a CONNECT request
     */
    // deno-lint-ignore no-explicit-any
    async connect<T = any>(
        path: string,
        params?: URLSearchParams,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#send("CONNECT", path, params, undefined, options);
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
        return await this.#send("TRACE", path, params, undefined, options);
    }
}
