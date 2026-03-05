// REPLACE IN PROD
const BASE = 'http://localhost:8080/api';

export async function fetchUsers() {
    const res = await fetch(`${BASE}/users`);
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
    return res.json();
}

export async function fetchOrgs() {
    const res = await fetch(`${BASE}/orgs`);
    if (!res.ok) throw new Error(`Failed to fetch orgs: ${res.status} ${res.statusText}`);
    return res.json();
}

export async function fetchOrgUsers(orgId: number) {
    const res = await fetch(`${BASE}/orgs/${orgId}/users`);
    if (!res.ok) throw new Error(`Failed to fetch org users: ${res.status} ${res.statusText}`);
    return res.json();
}