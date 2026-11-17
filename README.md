# NoLag

**Português** | [English](README.en.md) | [Español](README.es.md)

Plugin para o Decky Loader (Steam Deck, Legion Go e similares com SteamOS e Bazzite) que reduz a latência e estabiliza a rede: otimizações de Wi-Fi e rota por jogo com o Mudfish. Os dois módulos funcionam separados.

## Abas

- **Painel:** no topo, o gráfico ao vivo de ping e jitter, que mede sem parar a conexão normal ("Sem Mudfish", sem gastar créditos) e, com o Mudfish ligado, também pelo túnel ("Com Mudfish") para mostrar o ganho real, com o selo **Modo Apenas Jogo (Créditos Protegidos)** quando não há VPN total. Depois, o botão do **Mudfish** (verde quando ativo), a tabela Conexão e, mais ao final, o botão **Otimizar Wi-Fi**.
- **Wi-Fi:** otimizações da rede local (abaixo).
- **Mudfish:** fluxo guiado em 3 passos (instalar, entrar no painel, ativar) com detecção automática da sessão no painel (indicador "Conta conectada" / "Aguardando login na WebUI", sem botão manual), **Auto Selection** (ligado por padrão), **Multi-Path** (desligado), botão para abrir `http://127.0.0.1:8282`, conta opcional (usuário e senha, guardados só neste aparelho) e Opções Avançadas (porta do painel, reinstalar, resetar sessão, rota, ping, logs).
- **Conf:** ativar ao abrir jogo (desligado por padrão), manter ligado ao reiniciar (desligado por padrão), perfis por jogo com chaves de Wi-Fi e Mudfish, idioma (PT, EN, ES) e diagnóstico.

## Mudfish: primeiro uso (só uma vez)

1. Abra o painel (`http://127.0.0.1:8282`) e entre na conta.
2. Escolha o modo **Basic** ou **Multi-Path**.
3. Adicione à mão os jogos que quer otimizar, conferindo a região **Auto / South America**.

Esse cadastro é feito uma única vez e fica salvo na nuvem da conta Mudfish. Depois disso, o plugin só liga e desliga o serviço e os jogos equipados seguem por faixa de IP.

## Isolamento entre Wi-Fi e Mudfish

As otimizações de Wi-Fi **nunca** são desfeitas ao fechar um jogo, ao ligar o console ou ao desligar o Mudfish: só o botão (ou a aba Wi-Fi) as restaura. A regra de começar desligado e encerrar ao fechar o jogo vale **apenas** para o serviço do Mudfish.

## API local do Mudfish

O plugin lê (GET) o status do painel: a sessão vem do próprio cliente Mudfish (`isSignedIn`, sem JWT), o **Full VPN é travado em desligado** (se o painel o ligar, o serviço é encerrado para proteger créditos) e a medição de latência dos nós (`/do/rtt/*`) é acompanhada até ficar pronta. A interface `msk` do Mudfish é reconhecida na medição. Os comandos que alteram estado (Auto Selection e itens) ainda não são enviados: Conf > Diagnóstico captura, só em leitura, o contexto dessas chamadas em `mudfish-api.json` para conferi-las antes de ligá-las. Até lá, Auto Selection e Multi-Path ficam salvos e a tela avisa quando é preciso ativá-los no painel. O login automático com a conta opcional também depende dessa captura.

## Mudfish: proteção de créditos

O Mudfish cobra por tráfego. Por isso o NoLag **sempre começa com o Mudfish desligado**, ao ligar o console e ao abrir um jogo, a menos que você ative a opção na aba Conf. Ao fechar qualquer jogo, o Mudfish é encerrado na hora. Ligar à mão nunca ativa a opção de manter ligado.

- **Nunca baixe nada com o Mudfish ligado** (jogos, atualizações, arquivos): o tráfego é cobrado.
- Use só o roteamento por jogo no painel do Mudfish. **Não ative VPN total do sistema.** O NoLag avisa se o tráfego do sistema parecer passar pelo túnel.
- **Multi-Path** melhora estabilidade e jitter, mas gasta mais créditos.
- A instalação segue o guia oficial do SteamOS (instalador com `sh`, serviço `mudrun-headless` sem flags, login no painel) numa pasta persistente ligada em `/opt/mudfish`, e mostra o motivo exato quando algo falha. A API local do Mudfish não é documentada: Auto Selection e Multi-Path ficam salvos e o app avisa quando é preciso ativá-los no painel.

## Wi-Fi (módulo independente)

Aba **Wi-Fi**: otimizações da rede local que funcionam sozinhas, sem o Mudfish.

- Desligar a economia de energia, corrigir ao acordar, buffers de rede maiores, fila CAKE, IPv6, trava no ponto de acesso, banda preferida e DNS.
- Modo streaming (liga os ajustes só durante um stream) e correção de streams travados.
- **Aplicar otimizações seguras** liga tudo de uma vez; **Restaurar padrão** desliga os ajustes de rede e mantém **Corrigir ao acordar** ligado.
- Os ajustes sobrevivem a suspensão, reconexão e atualização do sistema (SteamOS e Bazzite). Ao desinstalar o plugin, tudo é desfeito.
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
