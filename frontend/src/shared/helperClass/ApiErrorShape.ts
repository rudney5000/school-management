export interface ApiErrorShape {
    response?: {
        status?: number;
        data?: {
            error?: {
                code?: string;
                message?: string;
            };
        };
    };
    message?: string;
}