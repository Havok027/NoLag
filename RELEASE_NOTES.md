## v0.15.3

- **Latência dos nós agora mostra o valor em ms** na aba Mudfish (ex.: "Medida · 12 ms"). O valor é o RTT em tempo real, a mesma fonte do gráfico do painel do Mudfish; sem ele, mostra a melhor medição entre os nós (`/do/rtt/*`). Sem medida, a linha continua só com o estado.
- Só leitura (GET local), sem custo de créditos. Sem texto novo de i18n. Novos testes: `test_mudfish_v0153.py` e `v0153.test.cjs`.
