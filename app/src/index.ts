import weivData from './app';
let counter = 1;

async function testWeivData() {
    const result = await weivData
        .query("Tests/PopulationData")
        .skip(0)
        .limit(5)
        .include({ fieldName: "cityId", collectionName: "Cities" })
        .fields("city", "year", "cityId")
        .ge("year", 1999)
        .isNotEmpty("city")
        .ascending("city")
        .find()

    // const hasNext = result.hasNext();
    // const hasPrev = result.hasPrev();
    // const next = await result.next();
    // const prev = await result.next();
    console.log({ result: result.items, hasNext: result.hasNext(), hasPrev: result.hasPrev() })
    return { result, hasNext: result.hasNext(), hasPrev: result.hasPrev() };
}

async function test() {
    const startTime = new Date().getTime();
    // const result = await testWeivData();

    // console.log(result.result.items, duration);
    // // if (counter > 6) {
    // //     weivData.cleanup();
    // // }
    // counter++;
    // return { duration, result };

    const result = await weivData.removeReference("Tests/PopulationData", "cityId", "654b9d7f504ddb218237f92d", "655397840dde5495f604ace0")
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    console.log(result, duration);
    return result;
}

setTimeout(async () => {
    await test();

    // setTimeout(async () => {
    //     await test();
    //     setTimeout(test, 1);
    // }, 1)
}, 1);

// setTimeout(test, 6000);
// setTimeout(test, 8500);
// setTimeout(test, 8500);
// setTimeout(test, 9500);