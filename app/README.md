# FX Exposure Calculator - Calculadora de Exposição Cambial

Sistema profissional de análise de risco cambial com dados de volatilidade em tempo real para gestão financeira empresarial.

## 🎯 Características Principais

- **Dados Reais de Mercado**: Integração com Alpha Vantage API
- **Cálculo de VaR**: Value at Risk baseado em volatilidade histórica
- **Cache Inteligente**: Otimização automática de chamadas API
- **Rate Limiting**: Controle de requisições (5 calls/minuto)
- **Transparência Total**: Detalhamento completo dos cálculos matemáticos

## 📊 Caso de Uso Empresarial

**Exemplo Real**: TechBrasil Importadora com exposição de ¥ 2.000.000
- **VaR Calculado**: R$ 89.250 (5.7% da exposição)
- **Decisão**: Hedge de R$ 7.850 para eliminar risco de R$ 89k
- **Resultado**: Gestão profissional de risco cambial

👉 **Veja o exemplo completo em**: [BUSINESS_CASE_EXAMPLE.md](./BUSINESS_CASE_EXAMPLE.md)

## 🚀 Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Configuração da API

1. **Alpha Vantage API Key**:
   ```bash
   # Crie o arquivo .env.local
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

2. **Obter API Key**: [Alpha Vantage Free API](https://www.alphavantage.co/support/#api-key)

👉 **Setup completo em**: [ALPHA_VANTAGE_SETUP.md](./ALPHA_VANTAGE_SETUP.md)

### Executar o Projeto

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
NODE_ENV=production npm run build
```

Acesse [http://localhost:3000](http://localhost:3000) para usar a calculadora.

## 🔧 Funcionalidades Técnicas

### Integração Alpha Vantage
- **Rate Limiting**: 5 chamadas por minuto (automático)
- **Cache Diário**: Dados de volatilidade persistem por 24h
- **Fallback**: Dados sintéticos quando API indisponível
- **Monitoramento**: Contador de chamadas em tempo real

### Cálculos Financeiros
- **Volatilidade Real**: Baseada em 30 dias de dados históricos
- **VaR (Value at Risk)**: Fórmula padrão da indústria
- **Dias Úteis**: 252 dias por ano (padrão financeiro)
- **Transparência**: Todos os cálculos detalhados na interface

### Interface do Usuário
- **Controle Manual**: Botão "Pre-calculate Volatility"
- **Indicadores Visuais**: Status da fonte de dados
- **Cálculos Detalhados**: Seção com fórmulas e valores
- **Feedback em Tempo Real**: Loading states e mensagens

## 📈 Arquitetura do Sistema

```
/app
├── src/lib/alphaVantage.ts     # Serviço principal + rate limiter
├── src/app/api/volatility/     # API endpoint com cache
├── src/app/exposure-calculator/ # Interface principal
└── .env.local                  # Configuração da API key
```

## 🎯 Valor Empresarial

**Antes (sem a ferramenta)**:
- ❌ Decisões baseadas em intuição
- ❌ Surpresas no fluxo de caixa
- ❌ Gestão de risco inadequada

**Depois (com o FX Calculator)**:
- ✅ Decisões baseadas em dados reais
- ✅ Risco quantificado e controlado
- ✅ Estratégia de hedge profissional
- ✅ Conformidade com best practices

## 📚 Documentação

- 📋 **[Índice Completo](./INDEX.md)** - Navegação por toda a documentação
- 🏢 **[Caso de Uso Empresarial](./BUSINESS_CASE_EXAMPLE.md)** - Exemplo detalhado da TechBrasil
- 🔧 **[Documentação Técnica](./TECHNICAL_DOCUMENTATION.md)** - Arquitetura e implementação
- ⚙️ **[Setup Alpha Vantage](./ALPHA_VANTAGE_SETUP.md)** - Configuração da API

---

*Desenvolvido para demonstrar expertise em gestão de risco financeiro e integração de APIs de dados de mercado.*
