## v0.15.2

- **"Latência dos nós" não fica mais preso em "Medindo…":** a linha só aparecia como "Medida" quando as duas leituras do Mudfish (`/do/rtt/staticnodes` e `/do/rtt/vnodes`) estavam prontas ao mesmo tempo, e no Mudfish 6.6.4 isso podia nunca acontecer mesmo com o painel já mostrando o RTT em tempo real. Agora a linha mostra "Medida" quando qualquer uma das duas está pronta ou quando o RTT em tempo real (a mesma fonte do gráfico do painel) já traz dado recente.
- "Indisponível" só aparece se as duas leituras falharem e não houver RTT em tempo real.
- Só leitura (GET local), sem custo de créditos. Sem texto novo de i18n. Novo teste: `test_mudfish_v0152.py` e `v0152.test.cjs`.
