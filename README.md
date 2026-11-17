# NoLag

**Português** | [English](README.en.md) | [Español](README.es.md)

Plugin para o Decky Loader (Steam Deck, Legion Go e similares com SteamOS e Bazzite) que ajuda a reduzir a latência e a estabilizar a rede. Dois módulos independentes: **Wi-Fi** (otimizações da rede local) e **Mudfish** (instalação e serviço, com acesso rápido ao painel web).

## Como o NoLag usa o Mudfish

O NoLag **não configura rotas**. Ele cuida do básico e deixa o resto para o painel web do próprio Mudfish (`http://127.0.0.1:8282`):

- **O plugin faz:** instala o Mudfish numa pasta persistente, liga e desliga o serviço, mostra o ping atual e abre o painel com um toque.
- **O painel do Mudfish faz:** login, itens/jogos, região, seleção de nó, Multi-Path e todas as rotas.

O painel web não renderiza bem no Modo Jogo dentro do QAM, por isso o botão **Abrir painel do Mudfish** o abre no navegador do Steam.

## Abas

- **Painel:** ping atual em anel e gráfico, com jitter e perda de pacotes. Com o Mudfish ligado e o túnel respondendo, a medida vem do túnel; senão, da conexão normal (sem gastar créditos). Depois: botão do **Mudfish** (verde quando ativo), botão **Abrir painel do Mudfish**, aviso de créditos, tabela Conexão e botão **Otimizar Wi-Fi**.
- **Wi-Fi:** ações rápidas, otimizações, streaming e ajustes avançados (abaixo).
- **Mudfish:** estado em 3 passos (instalar, entrar no painel, serviço ligado), chave do serviço, **Abrir painel do Mudfish**, guia de primeiro uso, aviso de créditos, atualização do núcleo, conta opcional e opções avançadas (porta, rota atual, alvo do ping, reinstalar, refazer login, logs).
- **Conf:** ativar ao abrir jogo (desligado por padrão), manter ligado ao reiniciar (desligado por padrão), perfis por jogo com chaves de Wi-Fi e Mudfish, idioma (PT, EN, ES) e diagnóstico.

## Mudfish: primeiro uso (só uma vez)

1. Ligue o Mudfish e toque em **Abrir painel do Mudfish**. Entre na conta.
2. No painel, adicione o jogo, escolha a região (**Auto / South America**), a seleção de nó e o modo (**Basic** ou **Multi-Path**).
3. Volte ao jogo.

Esse cadastro é feito uma única vez e fica salvo na nuvem da conta Mudfish. O NoLag não altera essas opções: depois disso, ele só liga e desliga o serviço (à mão ou, se você ativar na aba Conf, ao abrir e fechar o jogo).

## Mudfish: proteção de créditos

O Mudfish cobra por tráfego. Por isso o NoLag **sempre começa com o Mudfish desligado**, ao ligar o console e ao abrir um jogo, a menos que você ative a opção na aba Conf. Ao fechar qualquer jogo, o Mudfish é encerrado na hora. Ligar à mão nunca ativa a opção de manter ligado.

- **Nunca baixe nada com o Mudfish ligado** (jogos, atualizações, arquivos): o tráfego é cobrado.
- Use só o roteamento por jogo no painel do Mudfish. **Não ative VPN total do sistema.** Se o painel ligar o Full VPN, o NoLag encerra o serviço para proteger seus créditos.
- **Multi-Path** (configurado no painel) melhora estabilidade e jitter, mas gasta mais créditos.

## Detalhes técnicos do Mudfish

- A instalação segue o guia oficial do SteamOS (instalador com `sh`, serviço `mudrun-headless` sem flags) numa pasta persistente ligada em `/opt/mudfish`, e mostra o motivo exato quando algo falha.
- O plugin só **lê** a API local (status, sessão, telemetria) e usa as rotas oficiais de iniciar e parar. Ele detecta sozinho se você já entrou no painel.
- **Atualização do núcleo:** o NoLag consulta a página oficial de versões (no máximo a cada 6 horas) e avisa quando há núcleo novo. O botão **Atualizar** baixa, troca o binário e religa o serviço se estava ligado. Nada é instalado sem o seu toque.

## Wi-Fi (módulo independente)

Aba **Wi-Fi**: otimizações da rede local que funcionam com o Mudfish ligado ou desligado. Ordem na tela: ações rápidas, otimizações, streaming e avançado.

- **Ações rápidas:** **Aplicar otimizações seguras** liga tudo de uma vez; **Restaurar padrão** desliga os ajustes de rede e mantém **Corrigir ao acordar** ligado.
- **Otimizações:** desligar a economia de energia, corrigir ao acordar, buffers de rede maiores e fila CAKE.
- **Streaming:** modo streaming (liga os ajustes só durante um stream) e correção de streams travados.
- **Avançado:** IPv6, trava no ponto de acesso, banda preferida e DNS.
- Os ajustes **nunca** são desfeitos ao fechar um jogo, ao ligar o console ou ao desligar o Mudfish: só o botão (ou a aba Wi-Fi) os restaura. Eles sobrevivem a suspensão, reconexão e atualização do sistema (SteamOS e Bazzite). Ao desinstalar o plugin, tudo é desfeito.
- Não envia nada para a internet. Se o WiFi Optimizer original estiver instalado, desligue um dos dois.
- Módulo derivado do WiFi Optimizer 0.25.0 (Arcada Labs, BSD 3-Clause): veja `THIRD_PARTY_NOTICES.md`.

## Idiomas

Português, English e Español (Conf > Idioma).

## Desenvolvimento

```
pnpm install
pnpm test
pnpm build
```
