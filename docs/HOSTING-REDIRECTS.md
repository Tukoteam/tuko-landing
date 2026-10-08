# Redirects 301 — hosting

Fuente de verdad en este repo (Netlify):

| Archivo | Cuándo aplica |
|---------|----------------|
| [`netlify.toml`](../netlify.toml) | Redirects + headers (`publish = "site"`) |
| Este doc | Nginx / Apache en VPS (referencia) |

Ya no hay `_redirects` ni `_headers` en la raíz: todo vive en `netlify.toml` para evitar deriva.

## Comprobar

```bash
curl -I https://tukoteam.com/blog/natrue-x-tuko.html
# Esperado: HTTP/2 301
# location: https://tukoteam.com/blog/natrue-x-tuko

curl -I https://tukoteam.com/AGENTS.md
# Esperado: 404 (docs fuera de publish)
```

## Nginx (si aplica)

```nginx
if ($request_uri ~ ^/(.*)\.html$) {
  return 301 /$1;
}
```

## Apache

```apache
RewriteEngine On
RewriteCond %{THE_REQUEST} \s/(.+)\.html[\s?]
RewriteRule ^ /%1 [R=301,L]
```
