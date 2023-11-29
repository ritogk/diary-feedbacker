export type OpenAICommunicatorType = {
  chat(text: string): Promise<string>
}
