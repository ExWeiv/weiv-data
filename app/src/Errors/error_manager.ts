import errors from './errors';

type SafeErrorsList = {
    [K in keyof typeof errors]: typeof errors[K];
};

type DynamicErrorKeys<T> = {
    [K in keyof T]: K;
}[keyof T];

class WeivDataErrorManager extends Error {
    constructor(errCode: DynamicErrorKeys<SafeErrorsList>) {
        super(errors[errCode]);
        this.message = `Code: ${errCode || "00000"} - ${errors[errCode]} (WeivData Error)`;
        this.name = "WeivDataErrorManager";
    }
}

export function kaptanLogar(errCode: DynamicErrorKeys<SafeErrorsList>, details?: string): never {
    const errMsg = errors[errCode];
    const error = new WeivDataErrorManager(errCode);
    const documentationLink = `https://weiv-data.apps.exweiv.com/modules/Errors.html`;
    const formattedMessage = `WeivData Error: ${errMsg}, ${details} - (Code: ${errCode}) - Error References: ${documentationLink}`;
    console.error(formattedMessage);
    throw error;
}