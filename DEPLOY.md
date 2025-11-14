# 🚀 Guia de Deploy - Calculadora SD Card Jimi IoT

## 📋 Pré-requisitos

- Docker instalado na VM
- Docker Compose instalado
- Nginx configurado como proxy reverso
- Domínio configurado: `calcularsd.jimibrasil.com.br`

---

## 🐳 Deploy com Docker

### 1. Clonar o repositório (ou fazer upload dos arquivos)

```bash
cd /opt
git clone <seu-repositorio> calculo-cartaosd
cd calculo-cartaosd
```

### 2. Build da imagem Docker

```bash
docker-compose build
```

### 3. Iniciar o container

```bash
docker-compose up -d
```

### 4. Verificar se está rodando

```bash
docker ps
docker logs calculo-sd
```

### 5. Testar localmente

```bash
curl http://localhost:8084
```

---

## 🔧 Configuração do Nginx (Proxy Reverso)

### Arquivo: `/etc/nginx/sites-available/calcularsd.jimibrasil.com.br`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name calcularsd.jimibrasil.com.br;

    access_log /var/log/nginx/calcular-sd-access.log;
    error_log /var/log/nginx/calcular-sd-error.log;

    client_max_body_size 10M;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:8084;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}
```

### Ativar o site

```bash
sudo ln -s /etc/nginx/sites-available/calcularsd.jimibrasil.com.br /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Configurar SSL/TLS com Let's Encrypt (Opcional, mas Recomendado)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d calcularsd.jimibrasil.com.br
```

O Certbot irá modificar automaticamente o arquivo de configuração do Nginx para adicionar SSL.

---

## 📊 Comandos Úteis

### Visualizar logs do container
```bash
docker logs -f calculo-sd
```

### Reiniciar o container
```bash
docker-compose restart
```

### Parar o container
```bash
docker-compose down
```

### Atualizar a aplicação
```bash
git pull
docker-compose build
docker-compose up -d
```

### Verificar status do container
```bash
docker ps
docker stats calculo-sd
```

### Acessar o container (debug)
```bash
docker exec -it calculo-sd sh
```

---

## 🔍 Troubleshooting

### Container não inicia
```bash
docker logs calculo-sd
docker-compose logs
```

### Porta 8084 já em uso
```bash
sudo lsof -i :8084
# ou
sudo netstat -tulpn | grep 8084
```

### Verificar conectividade
```bash
curl -I http://localhost:8084
curl -I http://calcularsd.jimibrasil.com.br
```

### Verificar configuração do Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## 🔄 Atualização Automática (Opcional)

Criar um script de atualização em `/opt/calculo-cartaosd/update.sh`:

```bash
#!/bin/bash
cd /opt/calculo-cartaosd
git pull
docker-compose build
docker-compose up -d
echo "Deploy atualizado em $(date)" >> deploy.log
```

Tornar executável:
```bash
chmod +x /opt/calculo-cartaosd/update.sh
```

---

## 📦 Estrutura de Arquivos no Container

```
/usr/share/nginx/html/
├── index.html
├── app.js
├── calculator.js
├── models.js
├── translations.js
├── styles.css
├── test.html
├── test.js
└── *.md files
```

---

## 🌐 Acessar a Aplicação

Após o deploy completo:
- **HTTP**: http://calcularsd.jimibrasil.com.br
- **HTTPS** (se SSL configurado): https://calcularsd.jimibrasil.com.br

---

## 📝 Notas Importantes

1. ✅ O container roda na porta **8084** internamente
2. ✅ O Nginx faz proxy reverso da porta **80/443** para **8084**
3. ✅ Todos os assets estáticos (JS, CSS) são servidos diretamente pelo Nginx
4. ✅ A aplicação é 100% frontend (JavaScript estático)
5. ✅ Não requer banco de dados ou backend

---

## 🆘 Suporte

Para problemas, verificar:
1. Logs do container: `docker logs calculo-sd`
2. Logs do Nginx: `sudo tail -f /var/log/nginx/calcular-sd-error.log`
3. Status dos serviços: `docker ps` e `sudo systemctl status nginx`
