# NoLag

**Português** | [English](README.en.md) | [Español](README.es.md)

Plugin para o Decky Loader (Steam Deck, Legion Go e similares com SteamOS e Bazzite) que reduz a latência e estabiliza a rede: otimizações de Wi-Fi e rota por jogo com o Mudfish. Os dois módulos funcionam separados.

## Abas

- **Painel:** duas chaves rápidas (Wi-Fi e Mudfish), o gráfico ao vivo de ping e jitter com e sem o Mudfish e a tabela Conexão.
- **Wi-Fi:** otimizações da rede local (abaixo).
- **Mudfish:** fluxo guiado em 3 passos (instalar, entrar no painel, ativar), **Auto Selection** (ligado por padrão), **Multi-Path** (desligado), botão para abrir o painel `http://127.0.0.1:8282` e Opções Avançadas (rota, ping antes e depois, logs).
- **Conf:** ativar ao abrir jogo (desligado por padrão), manter ligado ao reiniciar (desligado por padrão), perfis por jogo com chaves de Wi-Fi e Mudfish, idioma (PT, EN, ES) e diagnóstico.

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
- **Aplicar otimizações seguras** liga tudo de uma vez; **Restaurar** devolve o padrão do sistema.
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
