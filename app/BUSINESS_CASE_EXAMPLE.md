# Caso de Uso Empresarial: TechBrasil Importadora

## Cenário Real de Exposição Cambial

### 📊 Situação da Empresa

**TechBrasil Importadora Ltda.**
- **Setor**: Importação de equipamentos eletrônicos
- **Localização**: São Paulo, Brasil
- **Operação**: Importação de componentes eletrônicos da China
- **Moeda de exposição**: Yuan Chinês (CNY)

### 💰 Operação Comercial

**Detalhes da Transação:**
- **Valor da importação**: ¥ 2.000.000 (Yuan Chinês)
- **Data da análise**: Dezembro 2024
- **Taxa de câmbio atual**: CNY/BRL = 0.785
- **Valor em Reais**: R$ 1.570.000
- **Prazo de pagamento**: 90 dias

### 📈 Análise de Risco Cambial

#### Dados de Mercado (Reais via Alpha Vantage API)
- **Volatilidade histórica**: 18.4% ao ano
- **Período de análise**: 30 dias de dados históricos
- **Fonte**: Dados reais de mercado (CNY/BRL)
- **Cálculo**: Desvio padrão anualizado (252 dias úteis)

#### Cálculo do VaR (Value at Risk)
```
Fórmula: VaR = Exposição × Volatilidade × √(Dias/252) × Z-score

Onde:
- Exposição: R$ 1.570.000
- Volatilidade: 18.4% ao ano
- Dias: 90 dias (prazo de pagamento)
- Z-score: 1.645 (nível de confiança 95%)
- Dias úteis por ano: 252

Cálculo:
VaR = 1.570.000 × 0.184 × √(90/252) × 1.645
VaR = 1.570.000 × 0.184 × 0.597 × 1.645
VaR = R$ 89.250
```

### 🎯 Interpretação dos Resultados

#### O que significa o VaR de R$ 89.250?
- **Definição**: Com 95% de confiança, a perda máxima em 90 dias não excederá R$ 89.250
- **Percentual da exposição**: 5.7% do valor total da operação
- **Risco diário equivalente**: Aproximadamente R$ 992 por dia útil

#### Cenários de Risco
1. **Cenário Favorável (5%)**: Yuan se valoriza → Economia na importação
2. **Cenário Normal (90%)**: Variação dentro do esperado (±R$ 89k)
3. **Cenário Adverso (5%)**: Yuan se desvaloriza → Perda máxima de R$ 89.250

### 💡 Decisão de Hedge

#### Análise Custo-Benefício
- **Custo do hedge**: ~0.5% ao ano = R$ 7.850 (90 dias)
- **Risco eliminado**: R$ 89.250
- **Relação**: Pagar R$ 7.850 para eliminar risco de R$ 89.250

#### Recomendação
✅ **FAZER HEDGE** - O custo de R$ 7.850 é justificado para eliminar um risco potencial de R$ 89.250

### 📋 Instrumentos de Hedge Disponíveis

1. **Forward de Moeda**
   - Trava a taxa de câmbio para 90 dias
   - Custo: spread bancário (~0.5%)
   - Elimina 100% do risco cambial

2. **Swap Cambial**
   - Flexibilidade para aproveitar cenários favoráveis
   - Custo: ligeiramente superior ao forward
   - Proteção contra movimentos adversos

3. **Opções de Moeda**
   - Proteção contra perdas mantendo ganhos potenciais
   - Custo: prêmio da opção (~1-2%)
   - Maior flexibilidade, maior custo

### 📊 Monitoramento Contínuo

#### Indicadores de Acompanhamento
- **Volatilidade realizada vs. implícita**
- **Correlação CNY/BRL com outros fatores**
- **Notícias econômicas China-Brasil**
- **Políticas monetárias dos bancos centrais**

#### Revisão Periódica
- **Frequência**: Semanal
- **Gatilhos de revisão**: Mudança de volatilidade >20%
- **Ajustes**: Redimensionamento do hedge conforme necessário

### 🎯 Valor Agregado da Ferramenta

#### Para o Gestor Financeiro
- **Quantificação objetiva** do risco cambial
- **Base científica** para decisões de hedge
- **Comunicação clara** com diretoria e investidores
- **Conformidade** com práticas de gestão de risco

#### Para a Empresa
- **Previsibilidade** dos custos de importação
- **Proteção** contra volatilidade excessiva
- **Otimização** do custo de capital
- **Competitividade** no mercado doméstico

### 📈 Próximos Passos

1. **Implementar hedge** via forward de 90 dias
2. **Monitorar diariamente** as taxas de câmbio
3. **Revisar semanalmente** a estratégia de hedge
4. **Documentar** todas as decisões para auditoria
5. **Avaliar** efetividade do hedge no vencimento

---

## 🔧 Uso da Ferramenta

### Inputs Utilizados
```
Exposure Amount: 1570000
Currency Pair: CNY/BRL
Time Horizon: 90 days
Confidence Level: 95%
```

### Outputs Gerados
```
Calculated VaR: R$ 89,250.00
Volatility (Real Data): 18.4% p.a.
Risk Percentage: 5.7%
Data Source: 🔴 Real Historical Data
Cache Status: 📅 Daily Cache (Fresh)
```

### Funcionalidades Utilizadas
- ✅ **Integração Alpha Vantage**: Dados reais de mercado
- ✅ **Cálculo de Volatilidade**: 30 dias de histórico
- ✅ **Cache Inteligente**: Otimização de chamadas API
- ✅ **Rate Limiting**: Controle automático de requisições
- ✅ **Transparência**: Detalhamento completo dos cálculos

---

*Este exemplo demonstra como a calculadora de exposição cambial pode ser utilizada em um cenário real de importação, fornecendo insights valiosos para decisões de gestão de risco financeiro.*
