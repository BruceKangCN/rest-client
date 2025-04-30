import { join } from "node:path";


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
    updateOptions(options: RequestInit) {
        this.defaultOptions = { ...this.defaultOptions, ...options };
    }

    /**
     * send a REST request
     */
    // deno-lint-ignore no-explicit-any
    async #send<T = any>(
        method: HTTPMethod,
        path: string,
        params?: URLSearchParams,
        // deno-lint-ignore no-explicit-any
        data?: any,
        options?: RequestInit,
    ): Promise<T> {
        const url = this.#createRequestURL(path, params);
        const opt: RequestInit = { ...options };
        opt.method = method;

        if (data) {
            const headers = new Headers(opt.headers);
            headers.set("Content-Type", "application/json");
            opt.headers = headers;

            opt.body = JSON.stringify(data);
        }

        const res = await fetch(url, opt);

        if (!res.ok) {
            const msg = await res.text();
            throw Error(msg);
        }

        return await res.json();
    }

    #createRequestURL(path: string, params?: URLSearchParams): URL {
        const url = new URL(this.baseURL);

        url.pathname = join(url.pathname, path);
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
