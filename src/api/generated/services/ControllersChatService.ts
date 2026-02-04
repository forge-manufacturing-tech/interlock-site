/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatParamsDto } from '../models/ChatParamsDto';
import type { QueueTasksDto } from '../models/QueueTasksDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControllersChatService {
    /**
     * @param sessionId
     * @returns any
     * @throws ApiError
     */
    public static chatControllerListMessages(
        sessionId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sessions/{session_id}/messages',
            path: {
                'session_id': sessionId,
            },
        });
    }
    /**
     * @param sessionId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static chatControllerChat(
        sessionId: string,
        requestBody: ChatParamsDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sessions/{session_id}/chat',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param sessionId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static chatControllerQueue(
        sessionId: string,
        requestBody: QueueTasksDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sessions/{session_id}/queue',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
