import { Storage } from "@google-cloud/storage";

export const testWriteStorage = (_req: any, res: any) => {
  const storage = new Storage();
  const myBucket = storage.bucket("mylab-test-20210318");
  const file = myBucket.file("my-file.txt");
  const contents = "This is the contents of the file.";
  file
    .save(contents)
    .then(() => res.send("ok"))
    .catch((e) => res.send(e));
};

export const testReadStorage = (_req: any, res: any) => {
  const storage = new Storage();
  const myBucket = storage.bucket("mylab-test-20210318");
  const file = myBucket.file("my-file.txt");
  file
    .download()
    .then((c) => res.send(c.toString()))
    .catch((e) => res.send(e));
};
