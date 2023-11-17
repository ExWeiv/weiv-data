import weivData from './app';
let counter = 1;

async function testWeivData() {
    const result = await weivData
        .query("PopulationData", "Tests")
        .eq("city", "New York")
        .include({
            fieldName: "cityId",
            collectionName: "Cities",
            foreignField: "_id",
        })
        .limit(3)
        .find();

    const hasNext = result.hasNext();
    const hasPrev = result.hasPrev();
    const next = await result.next();
    const prev = await result.next();
    return { result, hasNext, hasPrev, next, prev };
}

async function test() {
    const startTime = new Date().getTime();
    const result = await testWeivData();
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    console.log(result.result.items, duration);
    // if (counter > 6) {
    //     weivData.cleanup();
    // }
    counter++;
    return { duration, result };
}

test();

// setTimeout(test, 1500);
// setTimeout(test, 2000);
// setTimeout(test, 6000);
// setTimeout(test, 8500);
// setTimeout(test, 8500);
// setTimeout(test, 9500);