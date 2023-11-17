/**
 * @description Use when logging errors and throwing errors. Don't forget in case of an error this will stop the code!
 * @param msg Error Message
 * @param code Error Code (Optional)
 * @returns `never`
 */
export function reportError(msg: string, code?: string): never {
    if (!msg) {
        console.error("Error Messagre Required!");
    }

    console.error(`${msg} - ${code}`);
    throw new Error(`${msg} - ${code}`);
}
