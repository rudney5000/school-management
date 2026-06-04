import { toast } from "sonner";
import {getErrorMessage} from "@shared/lib";

export const handleApiError = (error: unknown) => {
    if (error instanceof Error) {
        toast.error(error.message);
        return;
    }

    toast.error(getErrorMessage("common.unexpectedError"));
};