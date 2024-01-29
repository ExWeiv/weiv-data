import * as hooks from '../../../../../../../../../user-code/backend/WeivData/data';
export * from '../../../../../../../../../user-code/backend/WeivData/data';

export function testHooks() {
    console.log("Running");
    const x = hooks.testCall(1);
    console.log("Stop", x);
}