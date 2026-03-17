const ABACATEPAY_BASE_URL = process.env.ABACATEPAY_BASE_URL ?? "https://api.abacatepay.com/v2";

export function getAbacateApiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY;
  if (!key) throw new Error("ABACATEPAY_API_KEY não configurada.");
  return key;
}

export async function abacateRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${ABACATEPAY_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAbacateApiKey()}`,
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  const data = (await response.json()) as T;
  if (!response.ok) {
    throw new Error(`AbacatePay error (${response.status}): ${JSON.stringify(data)}`);
  }

  return data;
}
