import { ApiLogInterceptorFactory } from "@app/shared/interceptors";
import { ServiceName } from "@app/shared/constants";

export const ApiLogInterceptor = ApiLogInterceptorFactory(ServiceName.LOGGING);
