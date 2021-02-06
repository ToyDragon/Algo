import NewRepeatingSource from "./testing/repeating_source";
import NewSummingSource from "./summing_source";
import { SourceExpect } from "./testing/source_expect";

test("Single value child", (done) => {
    const inst = new Date("1/1/21");
    const summing_source = NewSummingSource([NewRepeatingSource([0], 1, inst)]);
    SourceExpect(summing_source, [
        { value: 0, instant: inst }
    ]).then(() => done());
    summing_source.Start();
});

test("Single value children", (done) => {
    const inst = new Date("1/1/21");
    const summing_source = NewSummingSource([NewRepeatingSource([1], 3, inst), NewRepeatingSource([2], 3, inst), NewRepeatingSource([4], 3, inst)]);
    SourceExpect(summing_source, [
        { value: 7, instant: inst },
        { value: 7, instant: null },
        { value: 7, instant: null }
    ]).then(() => done());
    summing_source.Start();
});

test("Differently lived children", (done) => {
    const inst = new Date("1/1/21");
    const summing_source = NewSummingSource([NewRepeatingSource([1], 2, inst), NewRepeatingSource([2], 3, inst), NewRepeatingSource([4], 1, inst)]);
    SourceExpect(summing_source, [
        { value: 7, instant: inst },
        { value: 3, instant: null },
        { value: 2, instant: null }
    ]).then(() => done());
    summing_source.Start();
});
