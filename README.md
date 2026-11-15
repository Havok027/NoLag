# NoLag

**Português** | [English](README.en.md) | [Español](README.es.md)

Plugin para o Decky Loader (Steam Deck, Legion Go e similares com SteamOS) que escolhe automaticamente, de forma gratuita, a melhor rota de rede até o servidor do jogo.

## Como usar

Ligue a **Rota automática** e abra o jogo. Só isso: o plugin detecta o servidor sozinho e já vem com a **Sensibilidade** em Equilibrado.

- O **Painel** mostra ping, jitter e perda ao vivo, a rota em uso e, em **Diagnóstico**, o que o plugin vê do jogo. Troque de aba por toque, A ou L1/R1; as setas recolhem as seções.
- O **Painel** também traz a **Qualidade** da conexão e um **gráfico ao vivo** com uma linha por rota. O botão **Y** mostra ou oculta a ajuda de cada opção.
- Sem relay, o plugin só monitora ping, jitter e perda até o servidor do jogo.
- Ligue a chave uma vez dentro do jogo: o NoLag salva o perfil dele, liga sozinho nas próximas vezes e desliga ao sair. Gerencie em Rotas > Perfis de jogos.
- Com relay, ele também testa os caminhos alternativos e usa o melhor.

## Relay automático (recomendado)

O usuário só liga a chave. O plugin gera a própria chave WireGuard, se cadastra sozinho nos relays listados no `relay-code.txt` e passa a medir e usar o melhor caminho.

Para o dono do projeto (uma vez):
1. Num servidor gratuito (ex.: Oracle Cloud Always Free, Ubuntu), coloque `relay-server.sh` e `enroll_server.py` na mesma pasta e rode `sudo bash relay-server.sh NoLag-BR`.
2. Na Oracle, libere UDP 51820 e TCP 8077 na Security List.
3. Cole a linha `nolag2:...` impressa no fim em uma linha do `relay-code.txt` na raiz do repositório. Esse código não tem chave privada e pode ficar em repositório público.
4. O servidor só encaminha UDP e ping, com limite de velocidade por aparelho, e bloqueia redes internas.

## Relays (opcional)

1. Em um servidor Linux gratuito (por exemplo, Oracle Cloud Always Free, Ubuntu), rode `sudo bash relay-setup.sh` (arquivo deste repositório). Ele instala o WireGuard e imprime um código. Na Oracle, libere também a porta UDP 51820 na Security List.
2. Pré-configurado: coloque o código em uma linha do arquivo `relay-code.txt` na raiz do repositório. O build inclui o arquivo na release e o plugin lê sozinho. Atenção: o código contém uma chave privada; se o repositório for público, qualquer pessoa pode usar o seu relay.
3. Alternativa: cole o código em **Relays** (até 4 relays).

## Mudfish / Rotas (módulo independente)

Aba **Rotas**: instala o Mudfish oficial numa pasta persistente (sobrevive a atualizações do SteamOS, ligada em `/opt/mudfish` com `mount --bind`), guarda o login, liga e desliga o serviço e mostra a porta 8282, a rota ativa e o ping antes e depois. O botão "Abrir painel do Mudfish" abre `http://127.0.0.1:8282` para escolher o nó. Funciona sem o Wi-Fi e sem a rota do NoLag. O Mudfish cobra por tráfego.

No Painel há uma chave para o Wi-Fi e outra para o Mudfish, e a tabela **Conexão** (interface, IP, gateway, ping e jitter). Cada jogo salvo pode ligar o Wi-Fi e/ou o Mudfish sozinho ao abrir; ao sair, só desliga o que ele mesmo ligou.

## Wi-Fi (módulo independente)

Aba **Wi-Fi**: otimizações da rede local que funcionam sozinhas, sem a rota do NoLag e sem o Mudfish.

- Desligar a economia de energia, corrigir ao acordar, buffers de rede maiores, fila CAKE, IPv6, trava no ponto de acesso, banda preferida e DNS.
- Modo streaming (liga os ajustes só durante um stream) e correção de streams travados.
- **Aplicar otimizações seguras** liga tudo de uma vez; **Restaurar** devolve o padrão do sistema.
- Os ajustes sobrevivem a suspensão, reconexão e atualização do sistema (SteamOS e Bazzite). Ao desinstalar o plugin, tudo é desfeito.
- Não envia nada para a internet. Se o WiFi Optimizer original estiver instalado, desligue um dos dois.
- Módulo derivado do WiFi Optimizer 0.25.0 (Arcada Labs, BSD 3-Clause): veja `THIRD_PARTY_NOTICES.md`.

## Como funciona

- O plugin acha o jogo aberto pelo Steam e observa (só leitura) para qual IP ele envia dados.
- Desvia só o tráfego para o IP do servidor pelo melhor caminho. Se o relay piorar, volta para a rota direta. Ao fechar o jogo, desligar ou descarregar o plugin, tudo é removido.
- Endereços privados nunca são desviados.
- Com relays, usa `ip`, `wg`, `iptables` e `ping`.

## Idiomas

Português, English e Español (Config. > Idioma).

## Desenvolvimento

```
pnpm install
pnpm test
pnpm build
```
