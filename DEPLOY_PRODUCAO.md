# Configuração de Produção - Nginx + Docker

## 📋 Instruções de Deploy

### 1. Na sua VM com Nginx:

**Copie o arquivo de configuração:**
```bash
# Copie o arquivo nginx-calcular-sd.conf para o diretório de sites-available do nginx
sudo cp nginx-calcular-sd.conf /etc/nginx/sites-available/calcular-sd

# Se você já tinha um arquivo chamado calcular-sd, faça backup primeiro:
sudo cp /etc/nginx/sites-available/calcular-sd /etc/nginx/sites-available/calcular-sd.bak
```

**Ative o site (se não estiver ativado):**
```bash
# Verifique se o link simbólico existe
ls -la /etc/nginx/sites-enabled/calcular-sd

# Se não existir, crie:
sudo ln -s /etc/nginx/sites-available/calcular-sd /etc/nginx/sites-enabled/calcular-sd
```

**Verifique a configuração do Nginx:**
```bash
sudo nginx -t
```

**Recarregue o Nginx:**
```bash
sudo systemctl reload nginx
```

### 2. Na sua máquina local (para testes):

**Construir e rodar o Docker:**
```powershell
cd "c:\Users\LuisGustavo\OneDrive - Newtec Telemetria\Documentos\calculo_cartaoSD"

# Build
docker-compose build

# Rodar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### 3. Testes:

- **Local (sem proxy):** http://localhost:8084
- **Produção (com proxy reverso):** http://calcularsd.jimibrasil.com.br/

## 🔧 Configuração SSL

Se você ainda não tem certificado SSL, gere com Let's Encrypt:

```bash
# Instale o certbot
sudo apt-get install certbot python3-certbot-nginx

# Gere o certificado (certbot vai criar os arquivos automaticamente)
sudo certbot certonly --nginx -d calcularsd.jimibrasil.com.br
```

Os certificados serão salvos em:
- `/etc/letsencrypt/live/calcularsd.jimibrasil.com.br/fullchain.pem` (crt)
- `/etc/letsencrypt/live/calcularsd.jimibrasil.com.br/privkey.pem` (key)

Atualize o arquivo nginx-calcular-sd.conf com esses caminhos:

```nginx
ssl_certificate /etc/letsencrypt/live/calcularsd.jimibrasil.com.br/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/calcularsd.jimibrasil.com.br/privkey.pem;
```

## 📊 Monitoramento

**Verificar status do container:**
```bash
docker-compose ps
docker-compose logs
```

**Verificar status do Nginx:**
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/calcularsd.access.log
sudo tail -f /var/log/nginx/calcularsd.error.log
```

## 🔄 Atualizar a aplicação

```powershell
# Na sua máquina local
git pull origin main
docker-compose build
docker-compose up -d
```

## ⚙️ Porta 8084

A aplicação roda na porta **8084** internamente e é exposta via proxy reverso na porta **80/443**.

**Arquitetura:**
```
Internet (80/443)
    ↓
Nginx Proxy Reverso (calcularsd.jimibrasil.com.br)
    ↓
Docker Container (porta 8084 do host)
    ↓
HTTP Server (porta 8080 do container)
```
