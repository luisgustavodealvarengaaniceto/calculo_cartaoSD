# Jimi DVR Recording Calculator

🎯 **Calculadora de Tempo de Gravação e Consumo de Dados para DVRs Jimi IoT**

Uma ferramenta web moderna e responsiva para calcular o tempo estimado de gravação e consumo de dados dos equipamentos DVR da Jimi IoT (modelos JC181, JC371, JC400 e JC450).

## 📋 Características

- ✅ Suporte para 4 modelos de DVR (JC181, JC371, JC400, JC450)
- ✅ Cálculos baseados no documento oficial Jimi IoT v1.1.5
- ✅ Interface moderna e responsiva
- ✅ Modo escuro/claro
- ✅ Bilíngue (Português/Inglês)
- ✅ Gráficos interativos com Chart.js
- ✅ Exportação para PDF e CSV
- ✅ Exibição de comandos do dispositivo
- ✅ Salva configurações localmente
- ✅ Tabela de referência com valores oficiais

## 🚀 Como Usar

### Opção 1: Abrir diretamente no navegador

1. Abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge, Safari)
2. Não requer servidor web - funciona localmente!

### Opção 2: Usando um servidor local (opcional)

```bash
# Python 3
python -m http.server 8000

# Node.js (com http-server)
npx http-server -p 8000
```

Depois acesse: `http://localhost:8000`

## 📊 Modelos Suportados

### 🟦 JC181
- **Capacidade máxima:** 128 GB
- **Canais:** 2 (CH1 e CH2)
- **Resoluções:** 360P, 480P, 720P, 1080P
- **FPS:** 15, 25, 30
- **Bitrate:** 0.5-8 Mbps
- **Comando:** `VIDEO,PARAM,<Canal>,<Resolução>,<FPS>,<Bitrate>,1`

**Perfis Pré-Configurados:**
- **Padrão:** CH1: 720P@4M, CH2: 360P@0.5M → 29.1h (64GB) / 58.3h (128GB)
- **Alta Resolução:** CH1: 1080P@8M, CH2: 360P@0.5M → 15.4h (64GB) / 30.8h (128GB)
- **Maior Tempo:** CH1: 480P@1M, CH2: 360P@0.5M → 87.4h (64GB) / 174.8h (128GB)

### 🟨 JC371
- **Capacidade máxima:** 256 GB
- **Canais:** 3 (CH1-Frontal, CH2-USB, CH3-DMS)
- **Resoluções:** 360P, 480P, 720P, 1080P
- **FPS:** 5-25
- **Bitrate:** 0.5-8 Mbps
- **Codec:** H.264 / H.265
- **Comando:** `VIDEORSL_SUB,<Canal>,<Resolução>,<FPS>,<Bitrate>,<Codec>`

**Perfis Pré-Configurados:**
- **Padrão:** CH1: 1080P@8M, CH2/CH3: 720P@4M → 4.1h (32GB) / 16.4h (128GB) / 32.8h (256GB)
- **Alta Resolução:** Todos: 1080P@8M → 2.7h (32GB) / 10.9h (128GB) / 21.9h (256GB)
- **Maior Tempo:** Todos: 360P@0.5M → 43.7h (32GB) / 174.8h (128GB) / 349.5h (256GB)

### 🟩 JC400
- **Capacidade máxima:** 256 GB
- **Canais:** 2 (IN e OUT)
- **Comando:** `CAMERA,<IN/OUT>,<Config>`
- **Configurações:**
  - OUT: 0=1080P@8M, 1=720P@4M, 2=480P@2M, 3=360P@0.5M
  - IN: 0=720P@6M, 1=720P@3M, 2=480P@2M, 3=360P@0.5M

**Perfis Pré-Configurados:**
- **Padrão:** OUT: 1080P@8M, IN: 720P@6M → 4.7h (32GB) / 18.7h (128GB) / 37.4h (256GB)
- **Maior Tempo:** Ambos: 360P@0.5M → 65.5h (32GB) / 262.1h (128GB) / 524.3h (256GB)

### 🟥 JC450
- **Capacidade máxima:** 2×256 GB (512 GB total)
- **Canais:** até 5 (CH1-CH5)
- **Resoluções:** 480P, 720P, 1080P
- **FPS:** 15, 25
- **Bitrate:** 1-4 Mbps
- **Comando:** `VIDEORSL,<Canal>,<Resolução>,<FPS>,<Bitrate em Kbps>`
- **Observação:** Com dois cartões, o tempo dobra

**Perfis Pré-Configurados:**
- **Padrão:** CH1: 720P@2M, CH2-5: 480P@1M → 43.7h (128GB) / 87.4h (256GB)
- **Alta Resolução:** CH1: 1080P@4M, CH2-5: 720P@2M → 21.8h (128GB) / 43.7h (256GB)
- **Maior Tempo:** Todos: 480P@1M → 52.4h (128GB) / 104.9h (256GB)

## 🧮 Lógica de Cálculo

### Fórmula Base
```
Tempo (horas) = (Espaço disponível em MB) / (Taxa de gravação em MB/h)
Taxa de gravação (MB/h) = (Bitrate em Mbps × 450)
```

**Observação:** 1 Mbps ≈ 0,45 GB/h ou 450 MB/h

### Espaço Útil
- **90% do total** é considerado espaço útil
- Exemplo: Cartão de 256 GB → 230,4 GB disponíveis

### Codec H.265
- Aplicado multiplicador de **0.7** (30% mais eficiente que H.264)

## 📁 Estrutura de Arquivos

```
calculo_cartaoSD/
├── index.html          # Página principal
├── styles.css          # Estilos customizados
├── translations.js     # Sistema de tradução PT/EN
├── models.js           # Configurações dos modelos DVR
├── calculator.js       # Motor de cálculo
├── app.js              # Lógica principal da aplicação
└── README.md           # Este arquivo
```

## 🎨 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **TailwindCSS** (CDN) - Framework CSS
- **JavaScript Vanilla** - Lógica da aplicação
- **Chart.js** - Gráficos interativos
- **jsPDF** - Exportação para PDF
- **Font Awesome** - Ícones
- **LocalStorage** - Persistência de dados

## 💡 Funcionalidades

### 1. Seleção de Modelo
Clique em um dos 4 cards de modelo para iniciar a configuração.

### 2. Perfis Pré-Configurados ⚡
Para facilitar o uso, cada modelo possui perfis pré-configurados baseados nos cenários mais comuns:
- **Padrão (Default):** Configuração balanceada recomendada pela Jimi IoT
- **Alta Resolução:** Máxima qualidade de vídeo
- **Maior Tempo de Gravação:** Otimizado para duração máxima

Basta selecionar um perfil e clicar em "Calcular" para ver os resultados instantaneamente!

### 3. Configuração Manual (Avançada)
Caso prefira personalizar cada canal individualmente:
- Selecione o tamanho do cartão SD
- Configure cada canal com:
  - Resolução
  - Frame rate (FPS)
  - Bitrate
  - Codec (quando disponível)

### 4. Resultados Detalhados
Clique em "Calcular" para ver:
- ⏱️ Tempo total estimado de gravação
- 💾 Consumo de dados (MB/s, GB/h, GB/dia)
- 📊 Gráfico comparativo por canal
- 📋 Tabela detalhada de cada canal
- 💻 Comando exato para o dispositivo

### 4. Exportação
- **PDF**: Relatório completo formatado
- **CSV**: Dados tabulares para análise

### 5. Extras
- 🌓 **Modo Escuro**: Toggle no header
- 🌍 **Bilíngue**: PT-BR ↔ EN
- 💾 **Auto-save**: Configurações salvas automaticamente
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile

## 📖 Validação

Os resultados são validados contra a tabela oficial do documento "DVR Products Recording Time Estimation and Data Consumption V1.1.5":

### JC181
| Configuração | Cartão | Tempo Est. |
|-------------|--------|------------|
| 720P@4M + 360P@0.5M | 64GB | ~29.1h |
| 720P@4M + 360P@0.5M | 128GB | ~58.3h |
| 1080P@8M + 360P@0.5M | 64GB | ~15.4h |
| 480P@1M + 360P@0.5M | 64GB | ~87.4h |

### JC371
| Configuração | Cartão | Tempo Est. |
|-------------|--------|------------|
| 1080P@8M + 720P@4M×2 | 32GB | ~4.1h |
| 1080P@8M + 720P@4M×2 | 128GB | ~16.4h |
| 1080P@8M (3CH) | 128GB | ~10.9h |
| 360P@0.5M (3CH) | 256GB | ~349.5h |

### JC400
| Configuração | Cartão | Tempo Est. |
|-------------|--------|------------|
| 1080P@8M + 720P@6M | 128GB | ~18.7h |
| 360P@0.5M (2CH) | 128GB | ~262.1h |

### JC450
| Configuração | Cartão | Tempo Est. |
|-------------|--------|------------|
| 720P@2M + 480P@1M×4 | 128GB | ~43.7h |
| 1080P@4M + 720P@2M×4 | 128GB | ~21.8h |
| 480P@1M (5CH) | 256GB | ~104.9h |

## 🔧 Personalização

### Adicionar Novo Modelo
Edite o arquivo `models.js` e adicione a configuração no objeto `dvrModels`:

```javascript
NOVO_MODELO: {
    name: 'NOVO_MODELO',
    maxCapacity: 256,
    cardSizes: [64, 128, 256],
    channels: [...],
    // ... demais configurações
}
```

### Alterar Idiomas
Edite `translations.js` para adicionar novos idiomas ou modificar traduções existentes.

### Customizar Cores/Tema
Modifique `styles.css` ou ajuste as classes TailwindCSS no `index.html`.

## 🐛 Troubleshooting

**Gráfico não aparece?**
- Verifique se o Chart.js está carregando corretamente
- Abra o Console do navegador (F12) para ver erros

**Exportação PDF não funciona?**
- Certifique-se de que o jsPDF está carregando via CDN
- Verifique bloqueadores de popup

**Configurações não salvam?**
- Verifique se o LocalStorage está habilitado no navegador
- Modo anônimo/privado pode bloquear LocalStorage

## 📄 Licença

© 2025 Newtec Telemetria - Todos os direitos reservados

Baseado no documento oficial Jimi IoT: "DVR Products Recording Time Estimation and Data Consumption V1.1.5"

## 🤝 Contribuições

Para melhorias ou correções:
1. Identifique o problema ou melhoria
2. Edite os arquivos relevantes
3. Teste em diferentes navegadores
4. Documente as mudanças

## 📞 Suporte

Para questões técnicas sobre os equipamentos DVR, consulte a documentação oficial da Jimi IoT ou entre em contato com o suporte técnico.

---

**Desenvolvido com ❤️ para facilitar o dimensionamento de sistemas DVR**
