" Plugins
call plug#begin()
	Plug 'preservim/nerdtree'
	Plug 'ryanoasis/vim-devicons'
	Plug 'neoclide/coc.nvim', {'branch': 'release'}
	Plug 'preservim/nerdcommenter'
	Plug 'junegunn/rainbow_parentheses.vim'
	Plug 'rrethy/vim-hexokinase', {'do': 'make hexokinase'}
	Plug 'dracula/vim'
call plug#end()

colorscheme dracula

" Start NERDtree and put the cursor back in the other window
autocmd VimEnter * NERDTree | wincmd p

" Exit Vim if NERDTree is the only window remaining in the only tab.
autocmd BufEnter * if tabpagenr('$') == 1 && winnr('$') == 1 && exists('b:NERDTree') && b:NERDTree.isTabTree() | quit | endif

" Close the tab if NERDTree is the only window remaining in it.
autocmd BufEnter * if winnr('$') == 1 && exists('b:NERDTree') && b:NERDTree.isTabTree() | quit | endif

" turn hybrid line numbers on
:set number relativenumber
:set nu rnu

" turn absolute numbers on
":set number
":set nu

" setting the terminal gui colors for the color preview
:set termguicolors

" bind CTRL+f to toggle the file manager
nmap <C-f> :NERDTreeToggle<CR>

" bind CTRL+/ to comment code out
vmap <C-_> <plug>NERDCommenterToggle
nmap <C-_> <plug>NERDCommenterToggle
  
set guifont=JetBrainsMono\ Nerd\ Font\ 11

" Shortcuts for split navigation
map <C-h> <C-w>h
map <C-j> <C-w>j
map <C-k> <C-w>k
map <C-l> <C-w>l

" Code Completion

inoremap <silent><expr> <TAB>
      \ pumvisible() ? "\<C-n>" :
      \ <SID>check_back_space() ? "\<TAB>" :
      \ coc#refresh()
inoremap <expr><S-TAB> pumvisible() ? "\<C-p>" : "\<C-h>"

function! s:check_back_space() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction

filetype plugin on

" Bracket Pair Colourizer

let g:rainbow#max_level = 16

let g:rainbow#pairs = [['(', ')'], ['[', ']'], ['{', '}']]

autocmd FileType * RainbowParentheses
