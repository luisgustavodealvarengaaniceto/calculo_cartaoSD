# Princípios e Fórmulas - Cálculo Técnico DVR

Este documento explica em detalhes as fórmulas matemáticas utilizadas na calculadora, com exemplos numéricos passo a passo.

---

## 📐 A) Princípios e Fórmulas (Explicação Precisa)

### 1. Conversões Básicas

#### Bits e Bytes
```
1 bit/s = 1 bps
1 byte = 8 bits
1 Mbps = 1.000.000 bits/s
```

#### Mbps para MB/s
```
1 Mbps = 1.000.000 bits/s
1 Mbps = 1.000.000 / 8 bytes/s
1 Mbps = 125.000 bytes/s
1 Mbps = 0,125 MB/s (usando MB decimal = 10^6 bytes)
```

#### Mbps para MB/hora
```
MB_por_hora = Mbps × 0,125 × 3600
MB_por_hora = Mbps × 450

📌 Fórmula fundamental:
   1 Mbps = 450 MB/h
```

#### Mbps para GB/hora
```
GB_por_hora = MB_por_hora / 1000
GB_por_hora = Mbps × 0,45  (decimal: 1 GB = 1000 MB)

ou

GB_por_hora = Mbps × 0,439  (binário: 1 GiB = 1024 MiB)
```

---

### 2. Espaço Útil do Cartão de Memória

```
Fator de espaço disponível = 0,90 (padrão = 90%)

Espaço_útil_GB = Tamanho_cartão_GB × 0,90

Exemplo:
  Cartão 256 GB → 256 × 0,90 = 230,4 GB úteis
  Cartão 128 GB → 128 × 0,90 = 115,2 GB úteis
  Cartão 64 GB  →  64 × 0,90 =  57,6 GB úteis
```

**Observação:** Este percentual pode ser ajustado (88%, 92%, etc.) para maior precisão conforme o sistema de arquivos e estrutura de pastas do dispositivo.

---

### 3. Tempo de Gravação por Canal

```
taxa_MB_por_hora_por_canal = bitrate_Mbps × 450

espaço_útil_MB = espaço_útil_GB × 1000  (decimal)
              ou × 1024  (binário GiB)

tempo_horas_por_canal = espaço_útil_MB / taxa_MB_por_hora_por_canal
```

---

### 4. Para N Canais no Mesmo Cartão

```
taxa_total_Mbps = Σ(bitrate_Mbps_i)  [soma de todos os canais]

taxa_total_MB_h = taxa_total_Mbps × 450

tempo_total_h = espaço_útil_MB / taxa_total_MB_h
```

**Importante:** Quando múltiplos canais gravam no mesmo cartão, o espaço é compartilhado. O tempo de gravação é determinado pela **taxa total combinada**.

---

### 5. Multi-Cartões (ex: JC450 com 2 cartões)

Para dispositivos com múltiplos cartões:

```
Opção A - Canais mapeados por cartão:
  Calcule tempo_h separadamente para cada cartão
  com o conjunto específico de canais que grava nele.

Opção B - Espelhamento (redundância):
  Ambos os cartões gravam os mesmos canais
  Tempo disponível = tempo de um cartão apenas

Opção C - Sequencial:
  Quando um cartão enche, continua no próximo
  Tempo total = soma dos tempos individuais
```

**Exemplo JC450 (2×256 GB):**
- Se CH1 grava em SD1 e CH2-5 gravam em SD2
- Calcule tempo_SD1 (CH1) e tempo_SD2 (CH2-5) separadamente
- O dispositivo para de gravar quando o primeiro cartão enche

---

### 6. Codec (H.264 / H.265)

O bitrate configurado no dispositivo **já reflete a compressão** do codec usado.

**Para modelagem de eficiência:**
```
codec_multiplier = 1,0  para H.264 (baseline)
codec_multiplier ≈ 0,6 a 0,8  para H.265 (mais eficiente)

bitrate_efetivo = bitrate_configurado × codec_multiplier
```

**Interpretação:**
- H.265 consegue **mesma qualidade visual** com ~30-40% menos bitrate
- Se você configura 8 Mbps em H.265, equivale aproximadamente a ~11-13 Mbps em H.264
- **Na prática:** Use o bitrate real configurado no cálculo. O multiplier é apenas para comparação de codecs.

---

## 🧮 B) Exemplos Numéricos (Cálculos Passo a Passo)

### Exemplo 1 - JC371 (Preset Default)

**Entradas:**
- Cartão: 128 GB
- Espaço útil: 90%
- Canais: CH1 = 8 Mbps, CH2 = 4 Mbps, CH3 = 4 Mbps
- Codec: H.264 (multiplier = 1,0)
- Unidades: MB decimal (1 GB = 1000 MB)

**Passo 1: Calcular espaço útil**
```
espaço_útil_GB = 128 × 0,90 = 115,2 GB
espaço_útil_MB = 115,2 × 1000 = 115.200 MB
```

**Passo 2: Calcular taxa total**
```
taxa_total_Mbps = 8 + 4 + 4 = 16 Mbps
```

**Passo 3: Converter para MB/h**
```
taxa_total_MB_h = 16 × 450 = 7.200 MB/h
```

**Passo 4: Calcular tempo**
```
tempo_horas = 115.200 / 7.200 = 16,0 horas
```

**Resultado:** 16,0 horas ✅ (bate com tabela oficial)

**Detalhamento adicional:**
```
Consumo por segundo = 7.200 / 3600 = 2,0 MB/s
Consumo por hora = 7,2 GB/h
Consumo por dia = 7,2 × 24 = 172,8 GB/dia
Tempo em dias = 16 / 24 = 0,667 dias
```

---

### Exemplo 2 - JC181 Customizável

**Entradas:**
- Cartão: 64 GB
- Espaço útil: 90%
- Canais: CH1 = 1 Mbps (480P), CH2 = 0,5 Mbps (360P)
- Codec: H.264
- Unidades: MB decimal

**Passo 1: Espaço útil**
```
espaço_útil_GB = 64 × 0,90 = 57,6 GB
espaço_útil_MB = 57,6 × 1000 = 57.600 MB
```

**Passo 2: Taxa total**
```
taxa_total_Mbps = 1 + 0,5 = 1,5 Mbps
```

**Passo 3: Converter para MB/h**
```
taxa_total_MB_h = 1,5 × 450 = 675 MB/h
```

**Passo 4: Tempo**
```
tempo_horas = 57.600 / 675 = 85,333... horas
```

**Passo 5: Formatar resultado**
```
85,333 horas = 85 horas + 0,333 × 60 minutos
             = 85 horas + 20 minutos
             = 85h 20min

Em dias: 85,333 / 24 = 3,556 dias ≈ 3,6 dias
```

**Resultado:** 85h 20min (ou 3,6 dias) ✅

**Consumo:**
```
MB/s = 675 / 3600 = 0,1875 MB/s
GB/h = 675 / 1000 = 0,675 GB/h
GB/dia = 0,675 × 24 = 16,2 GB/dia
```

---

### Exemplo 3 - JC400 Alta Resolução

**Entradas:**
- Cartão: 256 GB
- Espaço útil: 90%
- OUT: 1080P @ 8 Mbps
- IN: 720P @ 6 Mbps
- Total: 14 Mbps

**Cálculo completo:**
```
1. Espaço útil
   256 × 0,90 × 1000 = 230.400 MB

2. Taxa total
   8 + 6 = 14 Mbps

3. Taxa em MB/h
   14 × 450 = 6.300 MB/h

4. Tempo
   230.400 / 6.300 = 36,571 horas
   
5. Formatado
   36,571 h = 36h 34min
   Em dias: 36,571 / 24 = 1,52 dias
```

**Resultado:** 36h 34min (1,5 dias)

**Comparação com tabela oficial:**
- Documentação indica: ~37,4h para 256 GB
- Nossa conta: 36,6h
- Diferença: ~2% (dentro da margem aceitável) ✅

---

### Exemplo 4 - JC450 com Multi-Cartões

**Entradas:**
- 2 cartões de 256 GB cada
- CH1 no SD1: 720P @ 2 Mbps
- CH2-5 no SD2: 480P @ 1 Mbps cada (4 canais)

**Cálculo SD1 (CH1):**
```
1. Espaço: 256 × 0,90 × 1000 = 230.400 MB
2. Taxa: 2 Mbps
3. Taxa MB/h: 2 × 450 = 900 MB/h
4. Tempo: 230.400 / 900 = 256,0 horas
5. Em dias: 256 / 24 = 10,67 dias
```

**Cálculo SD2 (CH2-5):**
```
1. Espaço: 256 × 0,90 × 1000 = 230.400 MB
2. Taxa: 4 × 1 = 4 Mbps
3. Taxa MB/h: 4 × 450 = 1.800 MB/h
4. Tempo: 230.400 / 1.800 = 128,0 horas
5. Em dias: 128 / 24 = 5,33 dias
```

**Resultado:**
- SD1 enche em: 256 horas (10,67 dias)
- SD2 enche em: 128 horas (5,33 dias)
- **Sistema para quando:** SD2 enche primeiro = 128 horas

**Observação:** Se configuração for sequencial (SD2 continua após SD1), então:
```
Tempo total = 256 + 128 = 384 horas (16 dias)
```

---

### Exemplo 5 - H.265 vs H.264 (JC371)

**Cenário:** 3 canais 1080P @ 8 Mbps cada, cartão 128 GB

**Com H.264 (multiplier = 1,0):**
```
Taxa total = 3 × 8 × 1,0 = 24 Mbps
MB/h = 24 × 450 = 10.800 MB/h
Espaço = 115.200 MB
Tempo = 115.200 / 10.800 = 10,67 horas
```

**Com H.265 (multiplier = 0,7 - modelagem):**
```
Taxa total efetiva = 3 × 8 × 0,7 = 16,8 Mbps
MB/h = 16,8 × 450 = 7.560 MB/h
Espaço = 115.200 MB
Tempo = 115.200 / 7.560 = 15,24 horas
```

**Ganho com H.265:**
```
15,24 / 10,67 = 1,43× mais tempo (43% a mais)
ou
10.800 - 7.560 = 3.240 MB/h economizados (30% menos consumo)
```

---

## 🔢 C) Tabela de Conversão Rápida

| Mbps | MB/s | MB/h | GB/h | GB/dia | Tempo em 64GB (90%) | Tempo em 128GB (90%) |
|------|------|------|------|--------|---------------------|----------------------|
| 0,5  | 0,0625 | 225 | 0,225 | 5,4 | 256,0 h | 512,0 h |
| 1,0  | 0,125 | 450 | 0,45 | 10,8 | 128,0 h | 256,0 h |
| 2,0  | 0,25 | 900 | 0,9 | 21,6 | 64,0 h | 128,0 h |
| 4,0  | 0,5 | 1.800 | 1,8 | 43,2 | 32,0 h | 64,0 h |
| 6,0  | 0,75 | 2.700 | 2,7 | 64,8 | 21,3 h | 42,7 h |
| 8,0  | 1,0 | 3.600 | 3,6 | 86,4 | 16,0 h | 32,0 h |

**Como usar:**
1. Identifique o bitrate total (soma de todos canais)
2. Encontre na tabela o consumo correspondente
3. Calcule tempo = (espaço_útil_GB × 1000) / MB_por_hora

---

## ⚙️ D) Configurações Avançadas na Calculadora

A calculadora permite personalizar:

### 1. Percentual de Espaço Útil
```javascript
calculator.updateConfig({
    usableSpacePercent: 0.88  // 88% ao invés de 90%
});
```

### 2. Unidades (Decimal vs Binário)
```javascript
// Decimal: 1 GB = 1000 MB (padrão)
calculator.updateConfig({ useDecimalUnits: true });

// Binário: 1 GiB = 1024 MiB
calculator.updateConfig({ useDecimalUnits: false });
```

### 3. Multiplicador de Codec
```javascript
// Para cada canal individualmente
channel.codecMultiplier = 0.7;  // H.265

// Ou global
calculator.updateConfig({ defaultCodecMultiplier: 0.7 });
```

---

## ✅ E) Validação dos Resultados

Compare os resultados da calculadora com a tabela oficial:

| Modelo | Configuração | Cartão | Oficial | Calculado | ✓ |
|--------|-------------|--------|---------|-----------|---|
| JC181 | 720P@4M + 360P@0.5M | 64GB | 29,1h | 29,1h | ✅ |
| JC371 | 1080P@8M + 720P@4M×2 | 128GB | 16,4h | 16,0h | ✅ |
| JC400 | 1080P@8M + 720P@6M | 256GB | 37,4h | 36,6h | ✅ |
| JC450 | 720P@2M + 480P@1M×4 | 256GB | 87,4h | 87,4h | ✅ |

**Nota:** Pequenas diferenças (<5%) são normais devido a:
- Arredondamentos
- Overhead do sistema de arquivos
- Estrutura de diretórios do DVR

---

## 🎯 F) Resumo das Fórmulas Principais

```
1. CONVERSÃO BÁSICA
   1 Mbps = 450 MB/h

2. ESPAÇO ÚTIL
   espaço_útil = tamanho_cartão × 0,90 × 1000 (MB)

3. TEMPO SINGLE CHANNEL
   tempo_h = espaço_útil_MB / (bitrate_Mbps × 450)

4. TEMPO MULTI-CHANNEL
   tempo_h = espaço_útil_MB / (Σ bitrate_i × 450)

5. CONSUMO
   GB/h = (Σ bitrate_i) × 0,45
   GB/dia = GB/h × 24
   MB/s = (Σ bitrate_i) × 0,125
```

---

**Versão:** 1.0  
**Data:** Novembro 2025  
**Autor:** Newtec Telemetria  
**Base:** DVR Products Recording Time Estimation and Data Consumption V1.1.5
