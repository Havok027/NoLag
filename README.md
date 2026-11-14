# NoLag

**Português** | [English](README.en.md) | [Español](README.es.md)

Plugin para o Decky Loader (Steam Deck, Legion Go e similares com SteamOS) que escolhe automaticamente, de forma gratuita, a melhor rota de rede até o servidor do jogo.

## Como usar

1. Em um servidor Linux gratuito (por exemplo, Oracle Cloud Always Free, Ubuntu), rode `sudo bash relay-setup.sh` (arquivo deste repositório). Ele instala o WireGuard e imprime um código. Na Oracle, libere também a porta UDP 51820 na Security List.
2. No plugin, cole o código em **Relays**. O plugin cria e guarda os arquivos sozinho (até 4 relays).
3. Ligue a **Rota automática** e abra o jogo.

## Como funciona

- O plugin acha o jogo aberto pelo Steam e observa (só leitura) para qual IP ele envia dados. Não precisa digitar nada.
- Mede ping, jitter e perda pela rota direta e por cada relay, e desvia só o tráfego para o IP do servidor pelo melhor caminho.
- Se o relay piorar, o tráfego volta para a rota direta. Ao fechar o jogo, desligar ou descarregar o plugin, tudo é removido.
- Endereços privados nunca são desviados.

Usa `ip`, `wg`, `iptables` e `ping`, que o plugin confere ao ligar (nada de wg-quick).

## Idiomas

Português, English e Español (Config. > Idioma).

## Desenvolvimento

```
pnpm install
pnpm test
pnpm build
```
