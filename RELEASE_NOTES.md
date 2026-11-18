## v0.15.0

- **Full VPN permitido:** removida a trava que encerrava o Mudfish e mostrava erro quando o Full VPN estava ativo no painel. O serviço segue ligado e a tela mostra só um aviso informativo discreto: "Modo Full VPN ativo — todo o tráfego está sendo roteado", lembrando de manter downloads em segundo plano desativados. Útil para jogos sem item na região desejada.
- **Botão `?` na seção Mudfish (distinto do `? Ajuda` do topo):** abre, só ao tocar, um guia curto: quando usar o item do jogo, quando usar o Full VPN (apontando para o nó mais próximo, ex.: São Paulo) e a diferença entre os dois.
- Textos novos nos 3 idiomas (`mfTipBtn`, `mfTipTitle`, `mfTipItem`, `mfTipFull`, `mfTipDiff`); `mfFullVpnWarn` e `mfWarnSplit` reescritos; chave `mfErrFullVpn` removida.
- Novos testes: `test_mudfish_v0150.py` e `v0150.test.cjs`.
