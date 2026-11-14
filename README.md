# NoLag

**Português** | [English](README.en.md) | [Español](README.es.md)

Plugin para o Decky Loader (Steam Deck, Legion Go e similares com SteamOS) que escolhe automaticamente, de forma gratuita, a melhor rota de rede até o servidor do jogo.

## Como funciona

- Você informa o IP do servidor do jogo e liga a **Rota automática**.
- O plugin mede ping, jitter e perda pela rota direta e por cada relay WireGuard, e desvia só o tráfego para esse IP pelo melhor caminho.
- Se o relay piorar, o tráfego volta para a rota direta. Ao desligar ou descarregar o plugin, tudo é removido.
- Nada além do IP informado é alterado. Endereços privados são recusados.

## Relays (gratuitos)

1. Crie um servidor Linux gratuito (por exemplo, Oracle Cloud Always Free) na região desejada e abra a porta UDP 51820.
2. No servidor, instale o WireGuard, ative `net.ipv4.ip_forward=1` e crie o `wg0.conf`:

```
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = <chave privada do servidor>
PostUp = iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE

[Peer]
PublicKey = <chave pública do aparelho>
AllowedIPs = 10.8.0.2/32
```

3. No aparelho, crie um arquivo `.conf` (o nome vira o nome do relay) em `~/homebrew/settings/NoLag/relays/`, até 4 arquivos:

```
[Interface]
PrivateKey = <chave privada do aparelho>
Address = 10.8.0.2/32

[Peer]
PublicKey = <chave pública do servidor>
Endpoint = <IP do servidor>:51820
```

Requer `ip`, `wg`, `wg-quick`, `iptables` e `ping` no aparelho.

## Idiomas

Português, English e Español (Config. > Idioma).

## Desenvolvimento

```
pnpm install
pnpm test
pnpm build
```
