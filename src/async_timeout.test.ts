import { AsyncTimeout } from "./async_timeout";

test("Waits approx 100ms", async (done) => {
    const start = new Date();
    await AsyncTimeout(0);
    expect(new Date().getTime() - start.getTime()).toBeLessThan(10);
    await AsyncTimeout(100);
    expect(new Date().getTime() - start.getTime()).toBeLessThan(150);    
    await AsyncTimeout(50);
    expect(new Date().getTime() - start.getTime()).toBeLessThan(200);
    done();
});