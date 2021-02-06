import { AsyncTimeout } from "../../async_timeout";
import NewRepeatingSource from "./repeating_source"
import { SourceExpect } from "./source_expect";
import WaitingSource from "./waiting_source"

test("Waits for Next to be called before sending data", async (done) => {
    const source = new WaitingSource(NewRepeatingSource([0, 1, 2], 3, new Date("1/1/21")));
    let finished = false;
    SourceExpect(source, [
        { value: 0, instant: null },
        { value: 1, instant: null },
        { value: 2, instant: null },
    ]).then(() => {
        expect(finished).toBeTruthy();
        done();
    });
    source.Start();

    await AsyncTimeout(10);
    source.Next();
    await AsyncTimeout(10);
    source.Next();
    await AsyncTimeout(10);
    source.Next();
    await AsyncTimeout(20);
    finished = true;
    source.Next();
})