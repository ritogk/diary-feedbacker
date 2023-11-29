export type NotificationType = {
  notice(id: string, text: string): Promise<boolean>
}
