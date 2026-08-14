export type AccessGrant = {
  email: string;
  display_name: string | null;
  role: "master" | "client";
  status: "active" | "blocked";
  lifetime: boolean;
  expires_at: string | null;
  created_at?: string;
  last_seen_at?: string | null;
};

export function remainingDays(grant: AccessGrant | null) {
  if (!grant || grant.lifetime || !grant.expires_at) return null;
  return Math.max(0, Math.ceil((new Date(grant.expires_at).getTime() - Date.now()) / 86400000));
}

export function isGrantExpired(grant: AccessGrant | null) {
  return Boolean(grant && !grant.lifetime && (!grant.expires_at || new Date(grant.expires_at).getTime() <= Date.now()));
}

export function accessTimestamp() {
  return Date.now();
}
