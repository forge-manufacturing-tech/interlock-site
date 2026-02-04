/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControllersBlobsService {
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static blobsControllerDownload(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/blobs/{id}/download',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static blobsControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/blobs/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param sessionId
     * @returns any
     * @throws ApiError
     */
    public static blobsControllerList(
        sessionId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sessions/{session_id}/blobs',
            path: {
                'session_id': sessionId,
            },
        });
    }
    /**
     * @param sessionId
     * @returns any
     * @throws ApiError
     */
    public static blobsControllerUpload(
        sessionId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sessions/{session_id}/blobs',
            path: {
                'session_id': sessionId,
            },
        });
    }
}
