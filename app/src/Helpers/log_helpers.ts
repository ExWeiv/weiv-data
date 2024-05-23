import { getWeivDataConfigs } from '../Config/weiv_data_config';

export function logMessage(message: string, details?: any): void {
    try {
        const { logs } = getWeivDataConfigs();

        if (logs) {
            console.log('WeivData DevLog:', message, details);
        }

        return;
    } catch (err) {
        console.error('WeivData - Error for logger:', err);
        return;
    }
}