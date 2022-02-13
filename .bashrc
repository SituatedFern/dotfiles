#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
PS1='[\u@\h \W]\$ '

# User aliases
alias pipes='./Scripts/pipes.sh/pipes.sh'
alias yarn='sudo yarn'

# Starship Prompt
eval "$(starship init bash)"
. "$HOME/.cargo/env"
alias config='/usr/bin/git --git-dir=/home/ashwin/dotfiles/ --work-tree=/home/ashwin'
alias config='/usr/bin/git --git-dir=/home/ashwin/dotfiles/ --work-tree=/home/ashwin'
