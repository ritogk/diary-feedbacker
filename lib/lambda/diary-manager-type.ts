export type DiaryManagerType = {
  read(date: Date): Promise<{ id: string; text: string }>
  write(
    id: string,
    title: string,
    feedback: string,
    mental: number
  ): Promise<boolean>
}
