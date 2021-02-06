import NewRepeatingSource from "./repeating_source";
import { SourceExpect } from "./source_expect";

test("Single value", (done) => {
    const inst = new Date("1/1/21");
    const repeating_source = NewRepeatingSource([0], 1, inst);
    SourceExpect(repeating_source, [
        { value: 0, instant: inst }
    ]).then(() => done());
    repeating_source.Start();
});

test("Two values", (done) => {
    const inst = new Date("1/1/21");
    const repeating_source = NewRepeatingSource([0, 1], 2, inst);
    SourceExpect(repeating_source, [
        { value: 0, instant: inst },
        { value: 1, instant: null }
    ]).then(() => done());
    repeating_source.Start();
});

test("Looping values", (done) => {
    const inst = new Date("1/1/21");
    const repeating_source = NewRepeatingSource([0, 1], 4, inst);
    SourceExpect(repeating_source, [
        { value: 0, instant: inst },
        { value: 1, instant: null },
        { value: 0, instant: null },
        { value: 1, instant: null }
    ]).then(() => done());
    repeating_source.Start();
});