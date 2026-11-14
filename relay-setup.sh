#!/usr/bin/env bash
# NoLag: prepara um relay WireGuard (Ubuntu/Debian, como root) e imprime o código para colar no plugin.
# Uso: sudo bash relay-setup.sh [nome]
set -euo pipefail

make_code() { # nome ip porta chave_publica_servidor chave_privada_cliente
  local json
  json=$(printf '{"v":1,"n":"%s","e":"%s:%s","s":"%s","k":"%s","a":"10.8.0.2/32"}' "$1" "$2" "$3" "$4" "$5")
  printf 'nolag1:%s' "$(printf '%s' "$json" | base64 -w0 | tr '+/' '-_' | tr -d '=')"
}

main() {
  [ "$(id -u)" = 0 ] || { echo "Rode como root: sudo bash relay-setup.sh"; exit 1; }
  local name port dev ip sk spub ck cpub
  name=$(printf '%s' "${1:-relay}" | tr -cd 'A-Za-z0-9._ -' | cut -c1-24)
  port="${PORT:-51820}"
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq wireguard iptables curl
  dev=$(ip -4 route show default | awk '{print $5; exit}')
  ip=$(curl -4 -fsS https://api.ipify.org)
  umask 077
  sk=$(wg genkey); spub=$(printf '%s' "$sk" | wg pubkey)
  ck=$(wg genkey); cpub=$(printf '%s' "$ck" | wg pubkey)
  cat > /etc/wireguard/nolag.conf <<CONF
[Interface]
Address = 10.8.0.1/24
ListenPort = $port
PrivateKey = $sk
PostUp = iptables -I INPUT -p udp --dport $port -j ACCEPT; iptables -I FORWARD -i %i -j ACCEPT; iptables -I FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o $dev -j MASQUERADE
PostDown = iptables -D INPUT -p udp --dport $port -j ACCEPT; iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -s 10.8.0.0/24 -o $dev -j MASQUERADE

[Peer]
PublicKey = $cpub
AllowedIPs = 10.8.0.2/32
CONF
  echo 'net.ipv4.ip_forward=1' > /etc/sysctl.d/99-nolag.conf
  sysctl -q -p /etc/sysctl.d/99-nolag.conf
  systemctl enable --now wg-quick@nolag
  echo
  echo "Relay pronto. Na Oracle Cloud, libere também UDP $port na Security List da VCN."
  echo "Cole este código no plugin NoLag (Relays):"
  echo
  make_code "$name" "$ip" "$port" "$spub" "$ck"
  echo
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then main "$@"; fi
