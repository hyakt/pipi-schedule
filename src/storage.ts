import { Storage } from "@google-cloud/storage";

const filename = "credentials.json";

export const save = async (contents: string): Promise<void> => {
  const storage = new Storage();
  const myBucket = storage.bucket("pipi-schedule");
  return myBucket.file(filename).save(contents);
};

export const download = async () => {
  const storage = new Storage();
  const myBucket = storage.bucket("pipi-schedule");
  return myBucket.file(filename).download();
};
