# 📡 Comandos de Configuração dos Equipamentos

Este documento descreve os comandos corretos para configurar cada modelo de DVR.

---

## 🎥 JC181 (Suporta até 128GB)

### Comando de Gravação no Cartão SD

```
VIDEO,PARAM,<A>,<B>,<C>,<D>#
```

### Parâmetros

| Parâmetro | Descrição | Valores Possíveis |
|-----------|-----------|-------------------|
| **A** | Canal da câmera | `1` = Câmera principal (CH1) |
| **B** | Resolução | `480` = 720×480<br>`720` = 1280×720<br>`1080` = 1920×1080 |
| **C** | Taxa de quadros (FPS) | `30` = 30 fps<br>`25` = 25 fps<br>`15` = 15 fps |
| **D** | Bitrate (Mbps) | `1` a `8` (1M, 2M, 3M, 4M, 5M, 6M, 7M, 8M) |

### Exemplos

```bash
# CH1: 1080P @ 25fps @ 8 Mbps
VIDEO,PARAM,1,1080,25,8#

# CH1: 720P @ 30fps @ 4 Mbps
VIDEO,PARAM,1,720,30,4#

# CH1: 480P @ 15fps @ 2 Mbps
VIDEO,PARAM,1,480,15,2#
```

### ⚠️ Observações
- **CH2 (Câmera Interna)** é **FIXA**: 360P (640×360) @ 0.5M @ 25fps
- Apenas **CH1** é configurável
- CH2 não precisa de comando de configuração

---

## 🎥 JC371 (Suporta até 256GB)

### Comando de Gravação no Cartão SD

```
VIDEORSL_SUB,<P1>,<P2>,<P3>,<P4>,<P5>#
```

### Parâmetros

| Parâmetro | Descrição | Valores Possíveis |
|-----------|-----------|-------------------|
| **P1** | Canal da câmera | `1` = CH1 (Road-facing)<br>`2` = CH2 (USB camera)<br>`3` = CH3 (DMS camera) |
| **P2** | Resolução | CH1: `1080` / `720` / `480` / `360`<br>CH2: `1080` / `720` / `480` / `360`<br>CH3: `720` / `480` / `360` |
| **P3** | Taxa de quadros (FPS) | `5` a `25` fps |
| **P4** | Bitrate (Mbps) | `0.5` a `8` Mbps |
| **P5** | Codec de vídeo | `1` = H.264<br>`2` = H.265 |

### Valores Padrão
- CH1: 1080P @ 25fps @ 8 Mbps @ H.264
- CH2/CH3: 720P @ 15fps @ 4 Mbps @ H.264

### Exemplos

```bash
# CH1: 1080P @ 25fps @ 8 Mbps @ H.264
VIDEORSL_SUB,1,1080,25,8,1#

# CH2: 720P @ 15fps @ 4 Mbps @ H.265
VIDEORSL_SUB,2,720,15,4,2#

# CH3: 480P @ 15fps @ 2 Mbps @ H.264
VIDEORSL_SUB,3,480,15,2,1#
```

### ⚠️ Observações
- Suporte a **H.265** com economia de ~35% no bitrate
- **Tracksolid Pro** atualmente suporta apenas H.264
- Verifique se sua plataforma suporta H.265 antes de configurar

---

## 🎥 JC400 (Suporta até 256GB)

### Comando de Gravação no Cartão SD

```
CAMERA,<A>,<B>#
```

### Parâmetros

| Parâmetro | Descrição | Valores Possíveis |
|-----------|-----------|-------------------|
| **A** | Canal da câmera | `OUT` = Câmera externa<br>`IN` = Câmera interna |
| **B** | Preset (0-3) | Veja tabela abaixo |

### Presets Disponíveis

#### Canal OUT (Câmera Externa)

| Preset | Resolução | Bitrate |
|--------|-----------|---------|
| `0` | 1080P (1920×1080) | 8 Mbps |
| `1` | 720P (1280×720) | 4 Mbps |
| `2` | 480P (720×480) | 2 Mbps |
| `3` | 360P (640×360) | 0.5 Mbps |

#### Canal IN (Câmera Interna)

| Preset | Resolução | Bitrate |
|--------|-----------|---------|
| `0` | 720P (1280×720) | 6 Mbps |
| `1` | 720P (1280×720) | 3 Mbps |
| `2` | 480P (720×480) | 2 Mbps |
| `3` | 360P (640×360) | 0.5 Mbps |

### Exemplos

```bash
# OUT: 1080P @ 8 Mbps (Alta resolução)
CAMERA,OUT,0#

# IN: 720P @ 6 Mbps (Alta resolução)
CAMERA,IN,0#

# OUT: 720P @ 4 Mbps (Balanceado)
CAMERA,OUT,1#

# IN: 360P @ 0.5 Mbps (Economia máxima)
CAMERA,IN,3#

# Configuração completa (ambos canais)
CAMERA,OUT,0#
CAMERA,IN,0#
```

### ⚠️ Observações
- Sistema de **presets fixos** - não permite configuração customizada
- FPS é fixo em 25fps para todos os presets
- Codec fixo: H.264

---

## 🎥 JC450 (Suporta até 2×256GB)

### Comando de Gravação no Cartão SD

```
VIDEORSL,<A>,<B>,<C>,<D>#
```

### Parâmetros

| Parâmetro | Descrição | Valores Possíveis |
|-----------|-----------|-------------------|
| **A** | Número do canal | `1` = Road-facing/ADAS/Camera 1<br>`2` = USB camera/Camera 2<br>`3` = DMS camera/Camera 3<br>`4` = Camera 4<br>`5` = Camera 5 (apenas JC450PRO) |
| **B** | Resolução | `480` = 720×480<br>`720` = 1280×720<br>`1080` = 1920×1080 |
| **C** | Taxa de quadros (FPS) | `15` ou `25` fps |
| **D** | Bitrate (Kbps) | `1024` = 1 Mbps<br>`2048` = 2 Mbps<br>`3072` = 3 Mbps<br>`4096` = 4 Mbps |

### Valores Padrão

| Canal | Resolução | FPS | Bitrate |
|-------|-----------|-----|---------|
| CH1 | 720P | 25 | 2048 Kbps (2 Mbps) |
| CH2 | 480P | 15 | 1024 Kbps (1 Mbps) |
| CH3 | 480P | 15 | 1024 Kbps (1 Mbps) |
| CH4 | 480P | 15 | 1024 Kbps (1 Mbps) |
| CH5 | 480P | 15 | 1024 Kbps (1 Mbps) |

### Exemplos

```bash
# CH1: 1080P @ 25fps @ 4 Mbps (Alta resolução)
VIDEORSL,1,1080,25,4096#

# CH2: 720P @ 15fps @ 2 Mbps
VIDEORSL,2,720,15,2048#

# CH3: 480P @ 15fps @ 1 Mbps (Padrão)
VIDEORSL,3,480,15,1024#

# Configuração completa (todos canais)
VIDEORSL,1,720,25,2048#
VIDEORSL,2,480,15,1024#
VIDEORSL,3,480,15,1024#
VIDEORSL,4,480,15,1024#
VIDEORSL,5,480,15,1024#
```

### ⚠️ Observações
- **Dual card**: Suporta **2 cartões SD** (capacidade total combinada)
- CH1 (frontal) padrão: 25 fps
- CH2-CH5 padrão: 15 fps
- **CH5 disponível apenas no JC450PRO**
- 1080P disponível para JC450PRO e câmeras customizadas
- Bitrate especificado em **Kbps** (não Mbps)

---

## 🎬 Configuração Time-Lapse (JC450)

### Comando

```
ENCODEPRM,<A>,<B>,<C>,<D>#
```

### Parâmetros

| Parâmetro | Descrição | Valores Possíveis |
|-----------|-----------|-------------------|
| **A** | Taxa de captura (Hz) | `0.05` / `0.1` / `0.2` / `0.5` / `1` Hz |
| **B** | FPS de codificação | `10` a `100` fps (padrão: 50) |
| **C** | Resolução | `360P` / `480P` / `720P` |
| **D** | Bitrate (Kbps) | `1024` a `5120` Kbps (padrão: 2048) |

### Exemplo

```bash
# Time-lapse: captura 1 frame/segundo, codifica em 50fps, 720P, 2 Mbps
ENCODEPRM,1,50,720P,2048#
```

---

## 📊 Resumo Comparativo

| Modelo | Comando Principal | Formato Bitrate | Canais | Dual Card |
|--------|-------------------|-----------------|--------|-----------|
| **JC181** | `VIDEO,PARAM,A,B,C,D#` | Mbps direto | 2 (1 config) | ❌ |
| **JC371** | `VIDEORSL_SUB,P1,P2,P3,P4,P5#` | Mbps decimal | 3 | ❌ |
| **JC400** | `CAMERA,A,B#` | Presets fixos | 2 | ❌ |
| **JC450** | `VIDEORSL,A,B,C,D#` | Kbps (×1024) | 5 | ✅ |

---

## 💡 Dicas de Uso

1. **Sempre termine comandos com `#`** (exceto comentários)
2. **JC450**: Lembre-se de converter Mbps → Kbps (multiplique por 1024)
3. **JC371**: Codec H.265 economiza ~35% de espaço
4. **JC400**: Use presets - não há configuração customizada
5. **JC181**: CH2 é fixo, não precisa configurar

---

**Última atualização**: Novembro 2024  
**Gerado por**: Sistema de Calculadora DVR
