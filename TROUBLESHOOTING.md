# 🔧 Guia de Solução de Problemas - Docker

## ❌ Erro: "Failed to Setup IP tables: Unable to enable ACCEPT OUTGOING rule"

Este é um erro comum em servidores Ubuntu relacionado ao Docker e iptables.

### 🎯 Solução Rápida

Execute os seguintes comandos no servidor:

```bash
# 1. Parar containers em execução (se houver)
docker compose down

# 2. Reiniciar o serviço Docker
sudo systemctl restart docker

# 3. Limpar redes antigas
docker network prune -f

# 4. Tentar novamente
docker compose up -d
```

### 🔧 Solução Completa (se a rápida não funcionar)

```bash
# 1. Parar Docker
sudo systemctl stop docker

# 2. Limpar iptables relacionadas ao Docker
sudo iptables -t filter -F DOCKER-FORWARD 2>/dev/null || true
sudo iptables -t nat -F DOCKER 2>/dev/null || true
sudo iptables -t filter -F DOCKER 2>/dev/null || true
sudo iptables -t filter -X DOCKER 2>/dev/null || true

# 3. Remover todas as redes Docker
docker network prune -f

# 4. Iniciar Docker novamente
sudo systemctl start docker

# 5. Verificar status
sudo systemctl status docker

# 6. Tentar o deploy
cd ~/calculo_cartaoSD
docker compose up -d
```

### 🚀 Usando o Script Automático

Criamos um script que faz tudo automaticamente:

```bash
# Dar permissão de execução
chmod +x fix-docker.sh

# Executar
./fix-docker.sh

# Depois tente novamente
docker compose up -d
```

---

## ❌ Erro: "version is obsolete"

**Sintoma:**
```
WARN[0000] docker-compose.yml: the attribute `version` is obsolete
```

**Solução:**
Já corrigimos o arquivo `docker-compose.yml`. Faça git pull ou baixe a versão atualizada.

---

## ❌ Container não inicia ou para logo após iniciar

### Verificar logs
```bash
docker logs calculo-sd
docker compose logs
```

### Verificar se a porta está em uso
```bash
sudo lsof -i :8084
# ou
sudo netstat -tulpn | grep 8084
```

### Matar processo na porta 8084
```bash
sudo kill -9 $(sudo lsof -t -i:8084)
```

---

## ❌ Nginx retorna 502 Bad Gateway

**Causa:** Container não está respondendo na porta 8084

**Soluções:**

### 1. Verificar se o container está rodando
```bash
docker ps | grep calculo-sd
```

### 2. Verificar health do container
```bash
docker inspect calculo-sd | grep -A 10 Health
```

### 3. Testar conectividade local
```bash
curl http://localhost:8084
```

### 4. Verificar logs
```bash
docker logs calculo-sd
```

### 5. Reiniciar container
```bash
docker compose restart
```

---

## ❌ Permissão negada ao executar scripts .sh

**Erro:**
```
bash: ./script.sh: Permission denied
```

**Solução:**
```bash
chmod +x script.sh
./script.sh
```

Ou execute com bash:
```bash
bash script.sh
```

---

## ❌ Nginx: "nginx: [emerg] bind() to 0.0.0.0:80 failed"

**Causa:** Porta 80 já está em uso

**Verificar:**
```bash
sudo lsof -i :80
sudo netstat -tulpn | grep :80
```

**Solução:**
```bash
# Parar o processo que está usando a porta
sudo systemctl stop apache2  # Se for Apache
# ou
sudo kill -9 $(sudo lsof -t -i:80)

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## ❌ SSL/Certbot: "Failed to renew certificate"

**Solução:**
```bash
# Renovar manualmente
sudo certbot renew --force-renewal

# Se falhar, deletar e recriar
sudo certbot delete --cert-name calcularsd.jimibrasil.com.br
sudo certbot --nginx -d calcularsd.jimibrasil.com.br
```

---

## ✅ Comandos Úteis para Debug

### Verificar status geral
```bash
# Status do Docker
sudo systemctl status docker

# Status do Nginx
sudo systemctl status nginx

# Containers rodando
docker ps -a

# Redes Docker
docker network ls

# Uso de recursos
docker stats calculo-sd
```

### Logs em tempo real
```bash
# Container
docker logs -f calculo-sd

# Nginx access
sudo tail -f /var/log/nginx/calcular-sd-access.log

# Nginx error
sudo tail -f /var/log/nginx/calcular-sd-error.log
```

### Limpar recursos
```bash
# Parar tudo
docker compose down

# Remover containers parados
docker container prune -f

# Remover redes não utilizadas
docker network prune -f

# Remover imagens antigas
docker image prune -f

# Limpar tudo (cuidado!)
docker system prune -a -f
```

### Rebuild completo
```bash
# Parar e remover
docker compose down

# Rebuild sem cache
docker compose build --no-cache

# Iniciar
docker compose up -d

# Ver logs
docker compose logs -f
```

---

## 🆘 Ainda com problemas?

### Checklist completo:

1. ✅ Docker está instalado e rodando?
   ```bash
   docker --version
   sudo systemctl status docker
   ```

2. ✅ Porta 8084 está livre?
   ```bash
   sudo lsof -i :8084
   ```

3. ✅ Arquivos estão corretos?
   ```bash
   ls -la | grep -E "index.html|Dockerfile|docker-compose.yml"
   ```

4. ✅ Permissões corretas?
   ```bash
   ls -la
   # Deve mostrar arquivos legíveis
   ```

5. ✅ Container está saudável?
   ```bash
   docker ps
   docker inspect calculo-sd | grep -A 5 Health
   ```

6. ✅ Nginx está configurado corretamente?
   ```bash
   sudo nginx -t
   cat /etc/nginx/sites-enabled/calcularsd.jimibrasil.com.br
   ```

7. ✅ DNS está apontando corretamente?
   ```bash
   nslookup calcularsd.jimibrasil.com.br
   ping calcularsd.jimibrasil.com.br
   ```

---

## 📞 Logs importantes para compartilhar

Se precisar de ajuda, colete estas informações:

```bash
# Informações do sistema
uname -a
docker --version
docker compose version

# Status dos serviços
sudo systemctl status docker
sudo systemctl status nginx

# Logs do container
docker logs calculo-sd

# Logs do Nginx
sudo tail -50 /var/log/nginx/calcular-sd-error.log

# Configuração do Nginx
sudo cat /etc/nginx/sites-enabled/calcularsd.jimibrasil.com.br

# Teste de conectividade
curl -I http://localhost:8084
curl -I http://calcularsd.jimibrasil.com.br
```
