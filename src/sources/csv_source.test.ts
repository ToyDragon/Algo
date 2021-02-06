import * as stream from "stream";
import NewCSVSource from "./csv_source";
import { SourceExpect } from "./testing/source_expect";

test("Single value", (done) => {
    const s = new stream.Readable();
    const csv_source = NewCSVSource(s);
    csv_source.Start();
    const time = new Date("1/1/21");

    SourceExpect(csv_source, [
        { value: 100, instant: time }
    ]).then(() => done());

    s.push([(time.getTime() / 1000), 100, 1].join(","));
    s.push(null);
});

test("Interupted lines", (done) => {
    const s = new stream.Readable();
    const csv_source = NewCSVSource(s);
    csv_source.Start();

    const time_a = new Date("1/1/21");
    const time_b = new Date("1/1/21");
    time_b.setMinutes(time_b.getMinutes() + 1);
    const time_c = new Date("1/1/21");
    time_c.setMinutes(time_c.getMinutes() + 2);

    SourceExpect(csv_source, [
        { value: 100, instant: time_a },
        { value: 100, instant: time_b },
        { value: 100, instant: time_c }
    ]).then(() => done());

    let real_line = [(time_a.getTime() / 1000), 100, 1].join(",") + "\n";
    s.push(real_line.substr(0, 3));
    s.push(real_line.substr(3, 3));
    s.push(real_line.substr(6, 99));
    
    real_line = [(time_b.getTime() / 1000), 100, 1].join(",") + "\n";
    s.push(real_line.substr(0, real_line.indexOf(",")));
    s.push(real_line.substr(real_line.indexOf(","), 99));
    
    real_line = [(time_c.getTime() / 1000), 100, 1].join(",") + "\n";
    s.push(real_line.substr(0, real_line.indexOf(",") + 1));
    s.push(real_line.substr(real_line.indexOf(",") + 1, 99));

    s.push(null);
});

test("Combines same minute", (done) => {
    const s = new stream.Readable();
    const csv_source = NewCSVSource(s);
    csv_source.Start();

    const time_a = new Date("1/1/21");
    const time_b = new Date("1/1/21");
    time_b.setMinutes(time_b.getMinutes() + 0.5);

    SourceExpect(csv_source, [
        { value: 100, instant: time_a }
    ]).then(() => done());

    s.push([(time_a.getTime() / 1000), 80, 1].join(",") + "\n");
    s.push([(time_b.getTime() / 1000), 110, 2].join(",") + "\n");
    s.push(null);
});

test("Simulataneous lines", (done) => {
    const s = new stream.Readable();
    const csv_source = NewCSVSource(s);
    csv_source.Start();

    const time_a = new Date("1/1/21");
    const time_b = new Date("1/1/21");
    time_b.setMinutes(time_b.getMinutes() + 0.5);

    SourceExpect(csv_source, [
        { value: 100, instant: time_a }
    ]).then(() => done());
    
    s.push([(time_a.getTime() / 1000), 80, 1].join(",") + "\n" + [(time_b.getTime() / 1000), 110, 2].join(",") + "\n");
    s.push(null);
});