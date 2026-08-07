# Redirects 301 — hosting

El repo incluye:

| Archivo | Cuándo aplica |
|---------|----------------|
| [`_redirects`](../_redirects) | Netlify y Cloudflare Pages |
| [`vercel.json`](../vercel.json) | Vercel (`cleanUrls` + redirects) |
| Este doc | Nginx / Apache en VPS |

## Comprobar

```bash
curl -I https://tukoteam.com/blog/natrue-x-tuko.html
# Esperado: HTTP/2 301
# location: https://tukoteam.com/blog/natrue-x-tuko
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
