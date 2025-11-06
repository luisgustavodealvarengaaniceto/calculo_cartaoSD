# 📝 Registro de Alterações - DVR Calculator

## ✨ Atualização - Configurações Oficiais dos Equipamentos

### 🔧 Correções Implementadas

#### **JC181 (Suporta até 128GB)**
- ✅ **Adicionado cartão de 32GB** nas opções
- ✅ **CH2 (Câmera Interna) agora é FIXA**: 360P (640×360) @ 0.5 Mbps, 25 FPS
- ✅ **Apenas CH1 é configurável**:
  - Resoluções: 480P / 720P / 1080P
  - FPS: 15 / 25 / 30
  - Bitrates por resolução:
    - **480P**: 1M / 2M / 3M / 4M
    - **720P**: 1M / 2M / 3M / 4M / 5M / 6M
    - **1080P**: 1M / 2M / 3M / 4M / 5M / 6M / 7M / 8M
- 📌 **Comando atualizado**: `VIDEO,PARAM,<A>,<B>,<C>,<D>#`

#### **JC371 (Suporta até 256GB)**
- ✅ **Resoluções expandidas**: 360P / 480P / 720P / 1080P
- ✅ **Bitrates flexíveis**: 0.5M até 8M (todos os canais)
- ✅ **FPS configurável**: 5 / 10 / 15 / 20 / 25 FPS
- ✅ **Suporte a H.265** com economia de ~30% no bitrate
- ✅ **FPS padrão corrigido**:
  - CH1 (Road Facing): 25 FPS
  - CH2/CH3 (USB/DMS): 15 FPS
- ✅ **Preset H.265 adicionado** para otimização de espaço
- 📌 **Comando atualizado**: `VIDEORSL_SUB,<P1>,<P2>,<P3>,<P4>,<P5>#`

#### **JC400 (Suporta até 256GB)**
- ✅ **Mantido sistema de presets**:
  - **OUT Camera**: 1080P@8M / 720P@4M / 480P@2M / 360P@0.5M
  - **IN Camera**: 720P@6M / 720P@3M / 480P@2M / 360P@0.5M
- 📌 **Comando confirmado**: `CAMERA,<A>,<B>#`

#### **JC450 (Suporta até 512GB - Dual Card)**
- ✅ **Bitrates ajustados**:
  - **480P**: 1 Mbps (1024 Kbps)
  - **720P**: 2 Mbps (2048 Kbps)
  - **1080P**: 3 Mbps / 4 Mbps (3072/4096 Kbps)
- ✅ **FPS padrão corrigido**:
  - CH1 (Road Facing/ADAS): 25 FPS
  - CH2-CH5 (outras câmeras): 15 FPS
- ✅ **Nomes dos canais atualizados**:
  - CH1: Road Facing/ADAS Camera
  - CH2: USB Camera
  - CH3: DMS Camera
  - CH4: Camera 4
  - CH5: Camera 5 (PRO only)
- 📌 **Comando atualizado**: `VIDEORSL,<A>,<B>,<C>,<D>#`

---

## 🎨 Melhorias na Interface

### **JC181 - Interface Especial**
- 🔒 **CH2 exibe aviso visual** de configuração fixa (amarelo)
- ✏️ **CH1 totalmente configurável** com dropdowns dinâmicos
- 🔄 **Bitrates atualizam automaticamente** ao mudar resolução

### **Validação de Dados**
- ✅ CH2 do JC181 sempre incluído automaticamente nos cálculos
- ✅ Verificação de canais fixos antes de coletar dados
- ✅ Tratamento especial para elementos DOM não editáveis

---

## 📊 Cálculos Validados

### Exemplos de Referência (com 90% espaço útil):

| Modelo | Configuração | Cartão | Tempo Estimado |
|--------|-------------|--------|----------------|
| JC181 | CH1:720P@4M + CH2:360P@0.5M | 32GB | ~14.5h |
| JC181 | CH1:720P@4M + CH2:360P@0.5M | 64GB | ~29.1h |
| JC181 | CH1:1080P@8M + CH2:360P@0.5M | 128GB | ~30.8h |
| JC371 | CH1:1080P@8M + CH2/3:720P@4M (H.264) | 128GB | ~16.4h |
| JC371 | CH1:1080P@8M + CH2/3:720P@4M (H.265) | 128GB | ~23.4h |
| JC400 | OUT:1080P@8M + IN:720P@6M | 256GB | ~37.4h |
| JC450 | CH1:720P@2M + CH2-5:480P@1M | 256GB | ~87.4h |

---

## 🔄 Comandos Atualizados

### **JC181**
```
VIDEO,PARAM,1,720,25,4#
# CH2 is fixed: 360P (640×360) @ 0.5M
```

### **JC371**
```
VIDEORSL_SUB,1,1080,25,8,1#
VIDEORSL_SUB,2,720,15,4,1#
VIDEORSL_SUB,3,720,15,4,1#
```

### **JC400**
```
CAMERA,OUT,0#
CAMERA,IN,0#
```

### **JC450**
```
VIDEORSL,1,720,25,2048#
VIDEORSL,2,480,15,1024#
VIDEORSL,3,480,15,1024#
VIDEORSL,4,480,15,1024#
VIDEORSL,5,480,15,1024#
```

---

## 📚 Documentação

- ✅ Todas as configurações baseadas no **Jimi IoT Command Manual v1.1.5**
- ✅ Fórmula oficial: **1 Mbps = 450 MB/h**
- ✅ Espaço útil: **90% da capacidade do cartão**
- ✅ Cálculos validados contra dados oficiais

---

## 🚀 Como Testar

1. Abra `index.html` no navegador
2. Selecione **JC181**
3. Observe que:
   - ✅ Opção de 32GB está disponível
   - ✅ CH1 é configurável (3 resoluções × múltiplos bitrates)
   - ✅ CH2 mostra aviso "Configuração Fixa: 360P @ 0.5M"
4. Configure CH1 e clique em **Calcular**
5. Verifique que os resultados incluem automaticamente CH2

---

## ⚙️ Arquivos Modificados

- `models.js` - Especificações atualizadas de todos os equipamentos
- `app.js` - Lógica para canal fixo do JC181 + coleta de dados
- `translations.js` - Novas traduções (fixed_configuration, fps, bitrate)
- `CHANGELOG.md` - Este arquivo de registro

---

**Data**: 04/11/2025  
**Versão**: 2.0  
**Status**: ✅ Pronto para produção
