export interface AIProvider {
  generate<T>(input: {
    systemPrompt: string;
    userPrompt: string;
    schema?: object;
  }): Promise<T>;
}
