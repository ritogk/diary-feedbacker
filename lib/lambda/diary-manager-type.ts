export type DiaryManagerType = {
  write(feedback: string, mental: number): Promise<boolean>
  read(date: Date): Promise<string>
}
