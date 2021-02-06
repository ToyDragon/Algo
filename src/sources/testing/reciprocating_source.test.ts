import NewReciprocatingSource from "./reciprocating_source";
import { SourceData } from "../source";

test("One reciprocation", (done) => {
    const inst = new Date("1/1/21");
    const reciprocating_source = NewReciprocatingSource(0, 1, 10, 10, inst);
    let i = -1;
    let last_value = -1;
    reciprocating_source.OnData(async (source_data: SourceData) => {
        i++;

        if (!source_data.datapoint) {
            expect(i).toBe(10);
            done();
            return;
        }

        if (i === 0) {
            expect(source_data.datapoint!.value).toBe(0);
        }
        if (i === 5) {
            expect(source_data.datapoint!.value).toBe(1);
        }

        if (i <= 5) {
            expect(source_data.datapoint!.value).toBeGreaterThan(last_value);
        }
        else {
            expect(source_data.datapoint!.value).toBeLessThan(last_value);
        }
        last_value = source_data.datapoint!.value;
        
    });
    reciprocating_source.Start();
});

test("Two reciprocations match", (done) => {
    const inst = new Date("1/1/21");
    const reciprocating_source = NewReciprocatingSource(0, 1, 10, 20, inst);

    let i = -1;
    let first_iter_values: number[] = [];
    reciprocating_source.OnData(async (source_data: SourceData) => {
        i++;

        if (!source_data.datapoint) {
            expect(i).toBe(20);
            done();
            return;
        }

        if (i < 10) {
            first_iter_values.push(source_data.datapoint!.value);
            return;
        } else {
            expect(source_data.datapoint!.value).toBe(first_iter_values[i - 10]);
        }        
    });
    reciprocating_source.Start();
});