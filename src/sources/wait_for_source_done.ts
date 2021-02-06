import { Source } from "./source";

/**
 * Returns a promise that resolves when the source sends a data object with an empty datapoint.
 * @param source 
 */
export default function WaitForSourceDone(source: Source): Promise<void> {
    return new Promise((resolve) => {
        source.OnData((sourcedata) => {
            if (!sourcedata.datapoint) {
                resolve();
            }
        });
    });
}