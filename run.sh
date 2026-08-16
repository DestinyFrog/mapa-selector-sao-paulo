#!/usr/bin/bash

tmux new-session -d -s mapa -n dev

tmux send-keys -t mapa:dev "bun --hot run src/index.ts" 'C-m'
tmux split-window -t mapa:dev -h
tmux send-keys -t mapa:dev "bun --hot web/index.html" 'C-m'

tmux select-layout -t mapa:dev tiled

tmux attach-session -t mapa