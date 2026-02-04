/* Type-safe API client wrappers with better naming */
import {
    ControllersSessionsService,
    ControllersProjectsService,
    ControllersChatService,
    ControllersBlobsService,
    OpenAPI
} from './generated';

// Configure OpenAPI client
export function configureApiClient(token: string | null, baseUrl: string) {
    OpenAPI.BASE = baseUrl;
    OpenAPI.TOKEN = token || undefined;
}

// Sessions
export const SessionsAPI = {
    list: (projectId: string) => ControllersSessionsService.sessionControllerFindAll(projectId),
    create: (data: any) => ControllersSessionsService.sessionControllerCreate(data),
    findOne: (id: string) => ControllersSessionsService.sessionControllerFindOne(id),
    update: (id: string, data: any) => ControllersSessionsService.sessionControllerUpdate(id, data),
    remove: (id: string) => ControllersSessionsService.sessionControllerRemove(id),
    cancel: (id: string) => ControllersSessionsService.sessionControllerCancel(id),
    retry: (id: string) => ControllersSessionsService.sessionControllerRetry(id),
};

// Projects
export const ProjectsAPI = {
    list: () => ControllersProjectsService.projectsControllerFindAll(),
    create: (data: any) => ControllersProjectsService.projectsControllerCreate(data),
    getOne: (id: string) => ControllersProjectsService.projectsControllerFindOne(id),
    update: (id: string, data: any) => ControllersProjectsService.projectsControllerUpdate(id, data),
    remove: (id: string) => ControllersProjectsService.projectsControllerRemove(id),
    share: (id: string, data: any) => ControllersProjectsService.projectsControllerShare(id, data),
};

// Chat
export const ChatAPI = {
    listMessages: (sessionId: string) => ControllersChatService.chatControllerListMessages(sessionId),
    chat: (sessionId: string, data: any) => ControllersChatService.chatControllerChat(sessionId, data),
    queue: (sessionId: string, data: any) => ControllersChatService.chatControllerQueue(sessionId, data),
};

// Blobs
export const BlobsAPI = {
    list: (sessionId: string) => ControllersBlobsService.blobsControllerList(sessionId),
    upload: (sessionId: string) => ControllersBlobsService.blobsControllerUpload(sessionId),
    download: (id: string) => ControllersBlobsService.blobsControllerDownload(id),
    remove: (id: string) => ControllersBlobsService.blobsControllerRemove(id),
};
