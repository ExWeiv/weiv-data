import { getWeivDataConfigs } from '../Config/weiv_data_config';

export async function logMessage(message: string, details?: any): Promise<void> {
    try {
        const { logs } = await getWeivDataConfigs();
        
        if (logs) {
            console.info('WeivData Developer Log - ', message, details);
        }
    } catch (err) {
        throw new Error(`WeivData - Error for logger, ${err}`);
    }
}