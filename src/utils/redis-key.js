const KEY_PART_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeKeyPart(value, name) {
  if (typeof value !== 'string' || !KEY_PART_PATTERN.test(value)) {
    throw new Error(`${name} 必须是非空小写 kebab-case 字符串`);
  }

  return value;
}

export function buildRedisKey({ app, environment, domain, entity, identifier, purpose }) {
  const parts = [
    normalizeKeyPart(app, 'app'),
    normalizeKeyPart(environment, 'environment'),
    normalizeKeyPart(domain, 'domain'),
    normalizeKeyPart(entity, 'entity'),
    normalizeKeyPart(identifier, 'identifier'),
  ];

  if (purpose !== undefined) {
    parts.push(normalizeKeyPart(purpose, 'purpose'));
  }

  return parts.join(':');
}
