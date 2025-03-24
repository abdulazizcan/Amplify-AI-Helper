export function request(ctx) {
  const { interests = [] } = ctx.args;
  const prompt = `Suggest a travel destination using these interests: ${interests.join(", ")}.`;

  return {
    resourcePath: "/model/anthropic.claude-3-sonnet-20240229-v1:0/invoke",
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Human: ${prompt}\n\nAssistant:`,
              },
            ],
          },
        ],
      }),
    },
  };
}

export function response(ctx) {
  console.log("Bedrock raw response:", ctx.result.body);
  const parsedBody = JSON.parse(ctx.result.body);

  let completion = "";

  if (
    parsedBody.content &&
    Array.isArray(parsedBody.content) &&
    parsedBody.content[0]?.text
  ) {
    completion = parsedBody.content[0].text;
  } else if (parsedBody.completion) {
    completion = parsedBody.completion;
  } else if (parsedBody.candidates && parsedBody.candidates[0]?.output) {
    completion = parsedBody.candidates[0].output;
  }

  return {
    body: completion,
  };
}
