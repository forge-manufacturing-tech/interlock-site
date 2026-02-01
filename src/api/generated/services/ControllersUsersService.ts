/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiKeyResponse } from '../models/ApiKeyResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControllersUsersService {
    /**
     * @returns ApiKeyResponse Get API Key
     * @throws ApiError
     */
    public static getApiKey(): CancelablePromise<ApiKeyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/api_key',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * @returns ApiKeyResponse Rotate API Key
     * @throws ApiError
     */
    public static rotateApiKey(): CancelablePromise<ApiKeyResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/api_key/rotate',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
