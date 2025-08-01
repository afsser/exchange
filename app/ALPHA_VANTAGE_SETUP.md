# Alpha Vantage API Integration

## Configuração da API Key

Este projeto utiliza a **Alpha Vantage API** para obter dados de volatilidade cambial em tempo real.

### 1. Obter API Key Gratuita

1. Acesse: https://www.alphavantage.co/support/#api-key
2. Preencha o formulário com seu email
3. Você receberá sua API key gratuita instantaneamente

### 2. Configurar Variável de Ambiente

1. Crie/edite o arquivo `.env.local` na raiz do projeto:
```bash
ALPHA_VANTAGE_API_KEY=sua_api_key_aqui
```

2. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

### 3. Limites da API Gratuita

- **5 calls por minuto**
- **500 calls por dia**
- Dados históricos: até 20+ anos
- Suporte a 150+ moedas

### 4. Funcionalidades Implementadas

#### ✅ Rate Limiting Inteligente
- Controle automático de 5 calls/minuto
- Fallback para dados estáticos quando limite excedido
- Cache de 5 minutos para reduzir chamadas

#### ✅ Análise de Volatilidade Real
- Cálculo baseado em 30 dias de dados históricos
- Volatilidade anualizada (padrão da indústria)
- Análise de tendência automática

#### ✅ Métricas Avançadas
- **Volatility**: Desvio padrão anualizado dos retornos
- **Trend**: Direção e percentual de mudança (30 dias)
- **Price Range**: Mínimo, máximo e atual
- **Risk Score**: Classificação automática (Low/Medium/High)

#### ✅ Tratamento de Erros
- Fallback inteligente para dados históricos
- Indicadores visuais de fonte de dados
- Mensagens informativas sobre rate limits

### 5. Exemplo de Resposta da API

```json
{
  "from": "EUR",
  "to": "USD",
  "pair": "EUR/USD",
  "volatility": 12.3,
  "source": "alpha_vantage",
  "period": "30_days",
  "confidence": "high",
  "trend": {
    "direction": "up",
    "percentage": 2.1,
    "description": "Strengthening 2.1% over 30 days"
  },
  "priceRange": {
    "min": 1.0850,
    "max": 1.1120,
    "current": 1.0965
  },
  "riskScore": {
    "level": "medium",
    "score": 12.3,
    "description": "Moderate volatility - some price fluctuation expected"
  },
  "dataPoints": 30,
  "lastUpdated": "2025-08-01T10:30:00.000Z",
  "remainingCalls": 4
}
```

### 6. Melhorias para Produção

Para um ambiente de produção, considere:

1. **Alpha Vantage Premium** ($49.99/mês):
   - 75 calls/minuto
   - 75,000 calls/mês
   - Dados intraday

2. **Cache Redis**:
   - Cache distribuído para múltiplas instâncias
   - TTL configurável por par de moedas

3. **Fallback APIs**:
   - Integração com múltiplas fontes (Fixer.io, CurrencyAPI)
   - Balanceamento de carga entre APIs

4. **Monitoring**:
   - Logs estruturados
   - Métricas de usage da API
   - Alertas de rate limit

### 7. Valor para Recrutadores

Esta implementação demonstra:

- ✅ **Conhecimento Financeiro**: Cálculos de volatilidade padrão da indústria
- ✅ **Arquitetura Robusta**: Rate limiting, cache, fallbacks
- ✅ **UX Financeira**: Indicadores visuais, contexto de risco
- ✅ **Código Production-Ready**: Tratamento de erros, validações
- ✅ **Integração de APIs**: Consumo responsável de APIs externas

## Troubleshooting

### API Key não está funcionando
- Verifique se a variável `ALPHA_VANTAGE_API_KEY` está definida em `.env.local`
- Reinicie o servidor após adicionar a variável
- Teste a API key diretamente: `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=EUR&to_symbol=USD&apikey=SUA_API_KEY`

### Rate Limit Excedido
- O sistema automaticamente usa dados fallback
- Aguarde 1 minuto para nova tentativa
- Considere upgrade para plano Premium

### Dados não carregam
- Verifique conexão com internet
- Alguns pares de moedas podem não estar disponíveis na Alpha Vantage
- Sistema automaticamente usa dados estimados como fallback
