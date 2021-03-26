import { Storage } from '@google-cloud/storage'

const filename = 'token.json'

export const saveToken = async (token: string): Promise<void> => {
  const storage = new Storage()
  const myBucket = storage.bucket('pipi-schedule')
  return myBucket.file(filename).save(token)
}

export const downloadToken = async () => {
  const storage = new Storage()
  const myBucket = storage.bucket('pipi-schedule')
  return myBucket.file(filename).download()
}
