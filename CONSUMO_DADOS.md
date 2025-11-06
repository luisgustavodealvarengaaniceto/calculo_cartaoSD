# Consumo Médio de Dados - DVRs Jimi IoT

Este documento contém os valores de referência de consumo de dados dos equipamentos DVR da Jimi IoT, baseado no documento oficial "DVR Products Recording Time Estimation and Data Consumption V1.1.5".

---

## 🟦 JC181

### Consumo por Canal
- **Live video:** CH1 = 75 KB/s, CH2 = 75 KB/s
- **Event video (10s):** ~720 KB
- **Manual video (10s):** ~720 KB

### Tempo Estimado de Gravação

| Perfil | Configuração | Bitrate Total | Tempo (64 GB) | Tempo (128 GB) |
|--------|-------------|---------------|---------------|----------------|
| **Padrão** | CH1: 720P@4M<br>CH2: 360P@0.5M | 4.5 Mbps | 29.1 h | 58.3 h |
| **Alta Resolução** | CH1: 1080P@8M<br>CH2: 360P@0.5M | 8.5 Mbps | 15.4 h | 30.8 h |
| **Maior Tempo** | CH1: 480P@1M<br>CH2: 360P@0.5M | 1.5 Mbps | 87.4 h | 174.8 h |

---

## 🟨 JC371

### Consumo por Canal

| Tipo | CH1 (1080P) | CH2/CH3 (720P) |
|------|-------------|----------------|
| Live video | 75 KB/s | 75 KB/s |
| Event picture | 370 KB | 150 KB |
| Event video (15s) | 1 MB | — |
| Manual video (10s) | 12 MB | 6 MB |

### Tempo Estimado de Gravação

| Perfil | Configuração | Bitrate Total | 32 GB | 128 GB | 256 GB |
|--------|-------------|---------------|-------|--------|--------|
| **Padrão** | CH1: 1080P@8M<br>CH2/CH3: 720P@4M | 16 Mbps | 4.1 h | 16.4 h | 32.8 h |
| **Alta Resolução** | Todos: 1080P@8M | 24 Mbps | 2.7 h | 10.9 h | 21.9 h |
| **Maior Tempo** | Todos: 360P@0.5M | 1.5 Mbps | 43.7 h | 174.8 h | 349.5 h |

**Observação:** Suporta H.264 e H.265 (Tracksolid Pro apenas H.264)

---

## 🟩 JC400

### Consumo por Canal

| Tipo | CH1 | CH2 |
|------|-----|-----|
| Live video | 75 KB/s | 75 KB/s |
| Event video (15s) | 15 MB | 12 MB |
| Manual video (10s) | 10 MB | 9 MB |

### Tempo Estimado de Gravação

| Perfil | Configuração | Bitrate Total | 32 GB | 128 GB | 256 GB |
|--------|-------------|---------------|-------|--------|--------|
| **Alta Resolução (Padrão)** | OUT: 1080P@8M<br>IN: 720P@6M | 14 Mbps | 4.7 h | 18.7 h | 37.4 h |
| **Maior Tempo** | Ambos: 360P@0.5M | 1 Mbps | 65.5 h | 262.1 h | 524.3 h |

---

## 🟥 JC450

### Consumo por Canal

| Tipo | CH1 | CH2–CH5 |
|------|-----|---------|
| Live video | 75 KB/s | 65 KB/s |
| History video | 260 KB/s | 128 KB/s |
| Event video (10s) | 2.7 MB | 1.3 MB |
| Manual video (10s) | 2.7 MB | 1.3 MB |

### Tempo Estimado de Gravação (por cartão)

| Perfil | Configuração | Bitrate Total | 128 GB | 256 GB |
|--------|-------------|---------------|--------|--------|
| **Padrão** | CH1: 720P@2M<br>CH2-5: 480P@1M | 6 Mbps | 43.7 h | 87.4 h |
| **Alta Resolução** | CH1: 1080P@4M<br>CH2-5: 720P@2M | 12 Mbps | 21.8 h | 43.7 h |
| **Maior Tempo** | Todos: 480P@1M | 5 Mbps | 52.4 h | 104.9 h |

**Observação:** Com dois cartões (2×256 GB), o tempo de gravação dobra.

---

## 📊 Fórmulas de Cálculo

### Cálculo Básico
```
Tempo (horas) = (Espaço disponível em MB) / (Taxa de gravação em MB/h)
Taxa de gravação (MB/h) = (Bitrate em Mbps × 450)
```

**Conversão:** 1 Mbps ≈ 0,45 GB/h ou 450 MB/h

### Espaço Útil
- **90%** do espaço total do cartão é considerado utilizável
- Exemplo: Cartão de 256 GB → 230,4 GB disponíveis (234.881 MB)

### Codec H.265
- Aplicar multiplicador de **0.7** no bitrate (30% mais eficiente que H.264)
- Disponível apenas no JC371

---

## 💡 Consumo Médio de Dados Móveis (SIM)

O consumo médio equivale ao consumo de dados do chip SIM instalado no equipamento, incluindo:
- Transmissão de vídeo ao vivo (live streaming)
- Upload de vídeos de eventos
- Envio de fotos de eventos
- Comunicação com a plataforma de rastreamento

**Recomendação:** Dimensionar o plano de dados considerando o perfil de uso:
- **Uso intenso de live video:** 200-500 MB/dia
- **Apenas eventos:** 50-100 MB/dia
- **Modo econômico:** 20-50 MB/dia

---

## 🎯 Cenários de Uso Recomendados

### Transporte Público / Frotas
- **Modelo:** JC371 ou JC450
- **Perfil:** Padrão ou Alta Resolução
- **Cartão:** 256 GB ou superior
- **Motivo:** Múltiplas câmeras, alta demanda de qualidade

### Veículos Particulares
- **Modelo:** JC181 ou JC400
- **Perfil:** Padrão
- **Cartão:** 64-128 GB
- **Motivo:** Equilíbrio entre qualidade e custo

### Vigilância Prolongada
- **Modelo:** Qualquer
- **Perfil:** Maior Tempo de Gravação
- **Cartão:** Máximo suportado
- **Motivo:** Maximizar dias de retenção

---

## 📞 Suporte Técnico

Para mais informações sobre os equipamentos DVR da Jimi IoT:
- **Website:** www.jimilab.com
- **Documento base:** DVR Products Recording Time Estimation and Data Consumption V1.1.5

---

**Última atualização:** Novembro 2025  
**Calculadora disponível em:** [Jimi DVR Recording Calculator](index.html)
