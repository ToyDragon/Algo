/**
 * Promise-based interface for setTimeout.
 * @param millis 
 */
export function AsyncTimeout(millis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, millis);
    });
}