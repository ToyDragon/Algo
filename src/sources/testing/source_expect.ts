import { Source } from "../source";

export interface SourceExpectation{
    instant: Date | null;
    value: number | null;
}

/**
 * Verifies that the source provides the expected data. Pass in a null value on either instant or value field to prevent them from being validated.
 * @param source 
 * @param expectations 
 */
export function SourceExpect(source: Source, expectations: SourceExpectation[]): Promise<void> {
    return new Promise((resolve) => {
        let i = -1;
        source.OnData((sourcedata) => {
            ++i;
            if (i < expectations.length){
                expect(sourcedata.datapoint).not.toBeNull();
                if (sourcedata.datapoint === null) {
                    // The source ended sooner than expected, don't do any more validation.
                    resolve();
                    return;
                }

                const expected_instant = expectations[i].instant;
                if (expected_instant !== null) {
                    expect(sourcedata.datapoint.instant.getTime()).toBe(expected_instant.getTime());
                }

                const expected_value = expectations[i].value;
                if (expected_value !== null) {
                    expect(sourcedata.datapoint.value).toBe(expected_value);
                }
            } else {
                expect(sourcedata.datapoint).toBeNull();
                resolve();
            }
        });
    });
}