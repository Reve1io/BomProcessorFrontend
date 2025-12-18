export type TaskStatus =
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "NOT_FOUND";

export interface ProcessResponse {
    task_id: string;
    check_url: string;
    status: TaskStatus;
    message?: string;
}

export interface StatusResponse {
    status: TaskStatus;
    data?: any[];
    error?: string;
}
