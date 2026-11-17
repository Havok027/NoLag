## v0.13.0

Mudança de rumo: o plugin passa a ser facilitador de acesso e monitoramento. Rotas, itens e nós do Mudfish são configurados no painel web dele (porta 8282). Só o frontend e a documentação mudam; o backend não foi alterado.

- Botão **Abrir painel do Mudfish** de volta ao Painel, logo abaixo do botão do Mudfish (e mantido na aba Mudfish). Fica ativo quando a porta 8282 responde.
- Aba Mudfish: removidos Seleção Automática e Multi-Path. Ficam instalar, ligar/desligar o serviço, abrir o painel, aviso de créditos, atualização do núcleo, conta opcional e opções avançadas (sem "Testar ping" e sem ping antes/depois).
- Menus reordenados. Mudfish: estado, serviço, painel web, guia, créditos, atualização, avançado. Wi-Fi: ações rápidas, otimizações, streaming, avançado.
- Telemetria: só o **ping atual** (anel e gráfico) com jitter e perda de pacotes. Sem comparação Com/Sem Mudfish. A medida vem do túnel quando o Mudfish está ligado e respondendo; senão, da conexão normal (sem gastar créditos). Uma linha informa a origem.
- Textos revisados nos 3 idiomas (guia de primeiro uso, ajudas do Painel, Mudfish e Wi-Fi).
- READMEs reescritos (PT, EN, ES).
- Testes ajustados ao novo fluxo e novo `tests/v0130.test.cjs`.
