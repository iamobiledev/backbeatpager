export interface AuthEmailPolicy {
  allowedDomain?: string;
  allowedEmails?: string;
}

export function emailIsAllowed(
  email: string,
  policy: AuthEmailPolicy
): boolean {
  const normalized = email.trim().toLowerCase();
  const explicitlyAllowed = new Set(
    (policy.allowedEmails ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
  if (explicitlyAllowed.has(normalized)) return true;

  const domain = policy.allowedDomain?.trim().toLowerCase();
  return domain ? normalized.endsWith(`@${domain}`) : false;
}
