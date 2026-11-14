# NoLag

**Português** | [English](README.en.md) | [Español](README.es.md)

Plugin para o Decky Loader (Steam Deck, Legion Go e similares com SteamOS) que escolhe automaticamente, de forma gratuita, a melhor rota de rede até o servidor do jogo.

## Como usar

Ligue a **Rota automática** e abra o jogo. Só isso: o plugin detecta o servidor sozinho e já vem com a **Sensibilidade** em Equilibrado.

- O **Painel** mostra ping, jitter e perda ao vivo, a rota em uso e, em **Diagnóstico**, o que o plugin vê do jogo. Troque de aba por toque, A ou L1/R1; as setas recolhem as seções.
- O **Painel** também traz a **Qualidade** da conexão e um **gráfico ao vivo** com uma linha por rota. O botão **Y** mostra ou oculta a ajuda de cada opção.
- Sem relay, o plugin só monitora ping, jitter e perda até o servidor do jogo.
- Com relay, ele também testa os caminhos alternativos e usa o melhor.

## Relays (opcional)

1. Em um servidor Linux gratuito (por exemplo, Oracle Cloud Always Free, Ubuntu), rode `sudo bash relay-setup.sh` (arquivo deste repositório). Ele instala o WireGuard e imprime um código. Na Oracle, libere também a porta UDP 51820 na Security List.
2. Pré-configurado: coloque o código em uma linha do arquivo `relay-code.txt` na raiz do repositório. O build inclui o arquivo na release e o plugin lê sozinho. Atenção: o código contém uma chave privada; se o repositório for público, qualquer pessoa pode usar o seu relay.
3. Alternativa: cole o código em **Relays** (até 4 relays).

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
