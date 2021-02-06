import { AsyncTimeout } from "../async_timeout";
import { Source, SourceData } from "./source";
import WaitForSourceDone from "./wait_for_source_done";

class TestSource extends Source{
    Start(): void {}
    public async TestSend(sourcedata: SourceData): Promise<void> {
        this.SendData(sourcedata);
    }
}

test("Immediate return", async (done) => {
    const source = new TestSource();
    let expect_done = false;
    WaitForSourceDone(source).then(() => {
        expect(expect_done).toBe(true);
        done();
    });
    expect_done = true;
    source.TestSend({datapoint: null});
});

test("Delayed return", async (done) => {
    const source = new TestSource();
    let expect_done = false;
    WaitForSourceDone(source).then(() => {
        expect(expect_done).toBe(true);
        done();
    });
    await AsyncTimeout(20);
    source.TestSend({datapoint: {instant: new Date("1/1/21"), value: 0}});
    await AsyncTimeout(20);
    expect_done = true;
    source.TestSend({datapoint: null});
});