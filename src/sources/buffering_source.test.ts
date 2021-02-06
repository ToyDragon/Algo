import NewBufferingSource from "./buffering_source";
import NewRepeatingSource from "./testing/repeating_source";
import { SourceExpect } from "./testing/source_expect";

test("Simple pass through", (done) => {
    const start = new Date("1/1/21");
    const repeating_source = NewRepeatingSource([1], 5, start);
    const buffering_source = NewBufferingSource(repeating_source);
    SourceExpect(buffering_source, [
        { value: 1, instant: start },
        { value: 1, instant: null },
        { value: 1, instant: null },
        { value: 1, instant: null },
        { value: 1, instant: null }
    ]).then(() => done());
    buffering_source.Start();
});

test("OnData added after starting.", async (done) => {
    const start = new Date("1/1/21");
    const repeating_source = NewRepeatingSource([1], 5, start);
    const buffering_source = NewBufferingSource(repeating_source);
    
    const first_validation = SourceExpect(buffering_source, [
        { value: 1, instant: start },
        { value: 1, instant: null },
        { value: 1, instant: null },
        { value: 1, instant: null },
        { value: 1, instant: null }
    ]);
    buffering_source.Start();
    await first_validation;

    SourceExpect(buffering_source, [
        { value: 1, instant: start },
        { value: 1, instant: null },
        { value: 1, instant: null },
        { value: 1, instant: null },
        { value: 1, instant: null }
    ]).then(() => done());
});