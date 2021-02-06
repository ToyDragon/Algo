import { AsyncTimeout } from "../../async_timeout";
import { Source, SourceData } from "../source";
import { SourceExpect } from "./source_expect";

class PubliclyControllableSource extends Source {
    Start(): void {}
    
    public Send(sourcedata: SourceData): void {
        this.SendData(sourcedata);
    }
}

//TODO: Find a way to test failures.

test("Empty source", (done) => {
    const source = new PubliclyControllableSource();
    SourceExpect(source, []).then(() => done());
    source.Send({datapoint: null});
});

test("Only validates value", async (done) => {
    const source = new PubliclyControllableSource();
    SourceExpect(source, [
        {
            value: 0,
            instant: null
        }
    ]).then(() => done());
    source.Send({datapoint: {
        value: 0,
        instant: new Date("1/1/21")
    }});
    await AsyncTimeout(10);
    source.Send({datapoint: null});
});

test("Only validates instant", async (done) => {
    const source = new PubliclyControllableSource();
    const inst = new Date("1/1/21");
    SourceExpect(source, [
        {
            value: null,
            instant: inst
        }
    ]).then(() => done());
    source.Send({datapoint: {
        value: 1,
        instant: inst
    }});
    await AsyncTimeout(10);
    source.Send({datapoint: null});
});

test("Validates correct quantity of data", async (done) => {
    const source = new PubliclyControllableSource();
    SourceExpect(source, [
        {
            value: null,
            instant: null,
        },
        {
            value: null,
            instant: null,
        },
        {
            value: null,
            instant: null,
        }
    ]).then(() => done());
    
    source.Send({datapoint: {
        value: 1,
        instant: new Date("1/1/21")
    }});
    await AsyncTimeout(10);
    source.Send({datapoint: {
        value: 1,
        instant: new Date("1/1/21")
    }});
    await AsyncTimeout(10);
    source.Send({datapoint: {
        value: 1,
        instant: new Date("1/1/21")
    }});
    await AsyncTimeout(10);
    source.Send({datapoint: null});
});