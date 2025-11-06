# Guia de Comandos - DVRs Jimi IoT

Este documento contém todos os comandos necessários para configurar os equipamentos DVR da Jimi IoT via SMS, plataforma web ou aplicativo.

---

## 🟦 JC181 - Comandos de Vídeo

### Formato Geral
```
VIDEO,PARAM,<Canal>,<Resolução>,<FPS>,<Bitrate>,<Encoder>
```

### Parâmetros
- **Canal:** 1 = CH1 (Main), 2 = CH2
- **Resolução:** 480, 720, 1080
- **FPS:** 15, 25, 30
- **Bitrate:** 1-8 (em Mbps)
- **Encoder:** 1 = H.264 (padrão)

### Exemplos Práticos

**Perfil Padrão:**
```
VIDEO,PARAM,1,720,25,4,1
VIDEO,PARAM,2,360,25,0.5,1
```

**Perfil Alta Resolução:**
```
VIDEO,PARAM,1,1080,25,8,1
VIDEO,PARAM,2,360,25,0.5,1
```

**Perfil Maior Tempo:**
```
VIDEO,PARAM,1,480,25,1,1
VIDEO,PARAM,2,360,25,0.5,1
```

---

## 🟨 JC371 - Comandos de Vídeo

### Formato Geral
```
VIDEORSL_SUB,<Canal>,<Resolução>,<FPS>,<Bitrate>,<Codec>
```

### Parâmetros
- **Canal:** 1 = CH1 (Frontal), 2 = CH2 (USB), 3 = CH3 (DMS)
- **Resolução:** 360, 480, 720, 1080
- **FPS:** 5-25
- **Bitrate:** 0.5-8 (em Mbps)
- **Codec:** 1 = H.264, 2 = H.265

### Exemplos Práticos

**Perfil Padrão (H.264):**
```
VIDEORSL_SUB,1,1080,25,8,1
VIDEORSL_SUB,2,720,25,4,1
VIDEORSL_SUB,3,720,25,4,1
```

**Perfil Alta Resolução com H.265:**
```
VIDEORSL_SUB,1,1080,25,8,2
VIDEORSL_SUB,2,1080,25,8,2
VIDEORSL_SUB,3,1080,25,8,2
```

**Perfil Maior Tempo:**
```
VIDEORSL_SUB,1,360,25,0.5,1
VIDEORSL_SUB,2,360,25,0.5,1
VIDEORSL_SUB,3,360,25,0.5,1
```

**⚠️ Importante:** O Tracksolid Pro suporta apenas H.264 (codec=1)

---

## 🟩 JC400 - Comandos de Câmera

### Formato Geral
```
CAMERA,<Canal>,<Preset>
```

### Parâmetros OUT (Câmera Externa)
- **0:** 1080P @ 8 Mbps
- **1:** 720P @ 4 Mbps
- **2:** 480P @ 2 Mbps
- **3:** 360P @ 0.5 Mbps

### Parâmetros IN (Câmera Interna)
- **0:** 720P @ 6 Mbps
- **1:** 720P @ 3 Mbps
- **2:** 480P @ 2 Mbps
- **3:** 360P @ 0.5 Mbps

### Exemplos Práticos

**Perfil Alta Resolução (Padrão):**
```
CAMERA,OUT,0
CAMERA,IN,0
```

**Perfil Balanceado:**
```
CAMERA,OUT,1
CAMERA,IN,1
```

**Perfil Maior Tempo:**
```
CAMERA,OUT,3
CAMERA,IN,3
```

---

## 🟥 JC450 - Comandos de Vídeo

### Formato Geral
```
VIDEORSL,<Canal>,<Resolução>,<FPS>,<Bitrate>
```

### Parâmetros
- **Canal:** 1-5
- **Resolução:** 480, 720, 1080
- **FPS:** 15, 25
- **Bitrate:** 1024 (1M), 2048 (2M), 3072 (3M), 4096 (4M) - em Kbps

### Exemplos Práticos

**Perfil Padrão:**
```
VIDEORSL,1,720,25,2048
VIDEORSL,2,480,25,1024
VIDEORSL,3,480,25,1024
VIDEORSL,4,480,25,1024
VIDEORSL,5,480,25,1024
```

**Perfil Alta Resolução:**
```
VIDEORSL,1,1080,25,4096
VIDEORSL,2,720,25,2048
VIDEORSL,3,720,25,2048
VIDEORSL,4,720,25,2048
VIDEORSL,5,720,25,2048
```

**Perfil Maior Tempo:**
```
VIDEORSL,1,480,25,1024
VIDEORSL,2,480,25,1024
VIDEORSL,3,480,25,1024
VIDEORSL,4,480,25,1024
VIDEORSL,5,480,25,1024
```

---

## 📱 Comandos Gerais (Todos os Modelos)

### Consultar Configuração Atual
```
VIDEO#
```

### Reiniciar Dispositivo
```
RESET#
```

### Consultar Status do SD Card
```
SD#
```

### Formatar SD Card
```
FORMAT#
```

### Consultar Versão do Firmware
```
VERSION#
```

### Ativar/Desativar Gravação
```
REC,ON#    // Ativar gravação
REC,OFF#   // Desativar gravação
```

### Configurar Intervalo de Gravação
```
TIMER,<Hora_Início>,<Hora_Fim>#
```
Exemplo: `TIMER,08:00,18:00#` (grava das 8h às 18h)

---

## 🎯 Dicas de Configuração

### 1. Otimização de Espaço
- Use resoluções menores em câmeras secundárias
- Configure bitrate de acordo com a iluminação:
  - Dia claro: bitrate baixo
  - Noite/pouca luz: bitrate alto

### 2. Qualidade vs. Tempo
- **Alta qualidade:** 1080P @ 6-8 Mbps
- **Balanceado:** 720P @ 3-4 Mbps
- **Econômico:** 480P @ 1-2 Mbps

### 3. FPS Recomendado
- **Tráfego/movimento:** 25-30 FPS
- **Estacionamento:** 15 FPS
- **Vigilância noturna:** 15 FPS

### 4. Codec H.265 (JC371)
- Reduz uso de espaço em ~30%
- Requer mais processamento
- Compatibilidade limitada (não funciona com Tracksolid Pro)

---

## 🔧 Configuração via Plataforma

### Tracksolid Pro
1. Acesse: app.tracksolidpro.com
2. Login → Dispositivos → Selecione o DVR
3. Configuração → Vídeo
4. Ajuste os parâmetros e salve

### JimiIoT Cloud
1. Acesse: cloud.jimilab.com
2. Dispositivos → Selecione o equipamento
3. Configurações → Gravação
4. Configure e aplique

---

## 📋 Configuração Rápida por Cenário

### Táxi / Uber
```
Modelo: JC400
Perfil: Alta Resolução
OUT: 1080P@8M (CAMERA,OUT,0)
IN: 720P@6M (CAMERA,IN,0)
Cartão: 128-256 GB
```

### Ônibus / Transporte Público
```
Modelo: JC450
Perfil: Padrão
CH1: 720P@2M, Demais: 480P@1M
Cartão: 256 GB (cada)
```

### Caminhão de Carga
```
Modelo: JC181
Perfil: Balanceado
CH1: 720P@4M, CH2: 360P@0.5M
Cartão: 128 GB
```

### Veículo Executivo
```
Modelo: JC371
Perfil: Alta Resolução com H.265
Todos: 1080P@8M (H.265)
Cartão: 256 GB
```

---

## ⚠️ Avisos Importantes

1. **Backup antes de alterar:** Sempre faça backup das configurações antes de modificar
2. **Teste após configurar:** Verifique se a gravação está funcionando corretamente
3. **Compatibilidade de codec:** Verifique se a plataforma suporta H.265 antes de usar
4. **Capacidade do cartão:** Não ultrapasse a capacidade máxima suportada pelo modelo
5. **Formatação:** Use cartões de classe 10 ou superior (U1/U3)

---

## 🆘 Solução de Problemas

### Gravação não inicia
```
1. Verifique espaço no cartão: SD#
2. Formate o cartão: FORMAT#
3. Reinicie o dispositivo: RESET#
```

### Vídeo com travamentos
```
1. Reduza a resolução ou bitrate
2. Verifique a classe do cartão SD
3. Aumente o FPS se estiver muito baixo
```

### Consumo alto de dados móveis
```
1. Desative live streaming quando não necessário
2. Configure upload de eventos apenas
3. Use resoluções menores para transmissão
```

---

## 📞 Suporte

**Newtec Telemetria**
- Documentação técnica completa no diretório do projeto
- Use a calculadora web para dimensionamento correto
- Consulte CONSUMO_DADOS.md para estimativas de uso

---

**Versão:** 1.0  
**Data:** Novembro 2025  
**Base:** DVR Products Recording Time Estimation and Data Consumption V1.1.5
