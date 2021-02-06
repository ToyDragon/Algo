import NewRepeatingSource from "./testing/repeating_source";
import NewSerialSource from "./serial_source";
import { SourceExpect } from "./testing/source_expect";

test("Single source", (done) => {
    const start = new Date("1/1/21");
    const serial_source = NewSerialSource([NewRepeatingSource([0], 2, start)]);
    SourceExpect(serial_source, [
        { value: 0, instant: start },
        { value: 0, instant: null }
    ]).then(() => done());
    serial_source.Start();
});

test("Two sources", (done) => {
    const start = new Date("1/1/21");
    const serial_source = NewSerialSource([NewRepeatingSource([0], 1, start), NewRepeatingSource([1], 1, start)]);
    SourceExpect(serial_source, [
        { value: 0, instant: start },
        { value: 1, instant: start }
    ]).then(() => done());
    serial_source.Start();
});

test("Two sources, one empty", (done) => {
    const start = new Date("1/1/21");
    const serial_source = NewSerialSource([NewRepeatingSource([], 0, start), NewRepeatingSource([0], 1, start)]);
    SourceExpect(serial_source, [
        { value: 0, instant: start }
    ]).then(() => done());
    serial_source.Start();
});