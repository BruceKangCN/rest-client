import { deepMerge } from "@cross/deepmerge";

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

export class RESTError extends Error {
    request: Request;
    response: Response;

    constructor(req: Request, res: Response) {
        const msg =
            `request "${req.method} ${req.url}" respond with status ${res.status}`;
        super(msg);

        this.request = req;
        this.response = res;
    }
}

export class RestClient {
    baseURL: string;
    defaultOptions: RequestInit;

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

        return await res.json();
    }

    #createRequestURL(path: string, params?: URLSearchParams): URL {
        const url = new URL(path, this.baseURL);
        url.search = params?.toString() ?? "";

        return url;
    }

    // deno-lint-ignore no-explicit-any
    async get<T = any>(
        path: string,
        params?: URLSearchParams,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#send("GET", path, params, undefined, options);
    }

    // deno-lint-ignore no-explicit-any
    async head<T = any>(
        path: string,
        params?: URLSearchParams,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#send("HEAD", path, params, undefined, options);
    }

    // deno-lint-ignore no-explicit-any
    async post<T = any, U = any>(
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#send("POST", path, params, data, options);
    }

    // deno-lint-ignore no-explicit-any
    async put<T = any, U = any>(
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#send("PUT", path, params, data, options);
    }

    // deno-lint-ignore no-explicit-any
    async delete<T = any, U = any>(
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#send("DELETE", path, params, data, options);
    }

    // deno-lint-ignore no-explicit-any
    async patch<T = any, U = any>(
        path: string,
        params?: URLSearchParams,
        data?: U,
        options?: RequestInit,
    ): Promise<T> {
        return await this.#send("PATCH", path, params, data, options);
    }

    // TODO: connect, options, trace
}
